from rest_framework import serializers
from .models import Dataset, Equipment

class EquipmentSerializer(serializers.ModelSerializer):
    # Mapping fields to match frontend expectation (CSV headers usually mapped directly)
    # Frontend expects keys: 'Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature'
    # We can use SerializerMethodFields or just simple renaming if needed, 
    # but strictly frontend code uses: item['Equipment Name'], item['Type'], etc.
    # So we should serialize it that way.

    equipment_name = serializers.CharField(source='name')
    # type matches
    # flowrate matches (case sensitive?) Frontend uses title case "Flowrate"
    # To be safe and compliant with requirements "Columns (must exactly match CSV headers)"
    # The frontend code `EquipmentTable` uses: 'Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature'
    
    class Meta:
        model = Equipment
        fields = ['name', 'type', 'flowrate', 'pressure', 'temperature']

    def to_representation(self, instance):
        # Custom representation to match frontend exact keys
        return {
            "Equipment Name": instance.name,
            "Type": instance.type,
            "Flowrate": instance.flowrate,
            "Pressure": instance.pressure,
            "Temperature": instance.temperature
        }

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'upload_date', 'filename']
