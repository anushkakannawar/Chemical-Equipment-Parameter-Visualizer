from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from django.db.models import Avg, Count
from .models import Dataset, Equipment
from .serializers import DatasetSerializer, EquipmentSerializer
import pandas as pd
import io

class UploadView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request, format=None):
        if 'file' not in request.data:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        file_obj = request.data['file']
        
        if not file_obj.name.endswith('.csv'):
            return Response({'error': 'File must be a CSV'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read CSV
            df = pd.read_csv(file_obj)
            
            # Simple validation of headers
            required_cols = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_cols):
                 return Response({'error': f'Missing columns. Required: {required_cols}'}, status=status.HTTP_400_BAD_REQUEST)

            # Create Dataset
            dataset = Dataset.objects.create(filename=file_obj.name)

            # Bulk create equipment
            equipment_list = []
            for _, row in df.iterrows():
                equipment_list.append(Equipment(
                    dataset=dataset,
                    name=row['Equipment Name'],
                    type=row['Type'],
                    flowrate=row['Flowrate'],
                    pressure=row['Pressure'],
                    temperature=row['Temperature']
                ))
            
            Equipment.objects.bulk_create(equipment_list)

            return Response({'message': 'Upload successful', 'id': dataset.id}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_dataset_summary(dataset):
    equipment = dataset.equipment.all()
    
    # Calculate stats
    avg_flowrate = equipment.aggregate(Avg('flowrate'))['flowrate__avg'] or 0
    avg_pressure = equipment.aggregate(Avg('pressure'))['pressure__avg'] or 0
    avg_temperature = equipment.aggregate(Avg('temperature'))['temperature__avg'] or 0
    
    # Type distribution
    type_counts = equipment.values('type').annotate(count=Count('type'))
    type_distribution = {item['type']: item['count'] for item in type_counts}

    data = EquipmentSerializer(equipment, many=True).data

    return {
        'id': dataset.id,
        'filename': dataset.filename,
        'upload_date': dataset.upload_date,
        'avg_flowrate': avg_flowrate,
        'avg_pressure': avg_pressure,
        'avg_temperature': avg_temperature,
        'type_distribution': type_distribution,
        'data': data
    }

class SummaryView(APIView):
    def get(self, request):
        latest_dataset = Dataset.objects.order_by('-upload_date').first()
        if not latest_dataset:
             return Response({'error': 'No data available'}, status=status.HTTP_404_NOT_FOUND)
        
        summary = get_dataset_summary(latest_dataset)
        return Response(summary)

from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.serializers import ModelSerializer

class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data['email'],
            validated_data['password']
        )
        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class HistoryView(APIView):
    def get(self, request):
        datasets = Dataset.objects.order_by('-upload_date')[:5]
        # For history, frontend likely expects metadata + maybe summary. 
        # Requirement: "Clicking a history item should load and display... summary, charts, table".
        # So we should probably return full details for each history item or handle it lightly.
        # Frontend code assumes history items have structure similar to summary? 
        # Let's check frontend code assumption.
        # Dashboard.js: `if (item.data && item.type_distribution)` -> Implies full data attached to history item list
        
        response_data = []
        for ds in datasets:
             response_data.append(get_dataset_summary(ds))
        
        return Response(response_data)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from django.http import HttpResponse

class PDFReportView(APIView):
    def get(self, request, pk):
        try:
            dataset = Dataset.objects.get(pk=pk)
            summary = get_dataset_summary(dataset)

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="report_{dataset.filename}.pdf"'

            doc = SimpleDocTemplate(response, pagesize=letter)
            styles = getSampleStyleSheet()
            elements = []

            # Title
            elements.append(Paragraph(f"Parameter Report: {dataset.filename}", styles['Title']))
            elements.append(Spacer(1, 12))
            elements.append(Paragraph(f"Upload Date: {dataset.upload_date}", styles['Normal']))
            elements.append(Spacer(1, 24))

            # Summary Stats
            elements.append(Paragraph("Summary Statistics", styles['Heading2']))
            stats_data = [
                ['Parameter', 'Average Value'],
                ['Flowrate', f"{summary['avg_flowrate']:.2f}"],
                ['Pressure', f"{summary['avg_pressure']:.2f}"],
                ['Temperature', f"{summary['avg_temperature']:.2f}"]
            ]
            t_stats = Table(stats_data)
            t_stats.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            elements.append(t_stats)
            elements.append(Spacer(1, 24))

            # Equipment List (Top 20 for brevity)
            elements.append(Paragraph("Equipment Data (Top 20)", styles['Heading2']))
            eq_data = [['Name', 'Type', 'Flow', 'Press.', 'Temp.']]
            for item in summary['data'][:20]:
                 eq_data.append([
                     item['Equipment Name'], 
                     item['Type'], 
                     f"{item['Flowrate']}", 
                     f"{item['Pressure']}", 
                     f"{item['Temperature']}"
                 ])
            
            t_eq = Table(eq_data)
            t_eq.setStyle(TableStyle([
               ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
               ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
               ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
               ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
               ('FONTSIZE', (0, 0), (-1, -1), 8),
               ('GRID', (0, 0), (-1, -1), 0.5, colors.black)
            ]))
            elements.append(t_eq)

            doc.build(elements)
            return response
            
        except Dataset.DoesNotExist:
            return Response({'error': 'Dataset not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
