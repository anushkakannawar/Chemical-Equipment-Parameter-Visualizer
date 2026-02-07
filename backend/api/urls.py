from django.urls import path
from .views import UploadView, SummaryView, HistoryView, RegisterView, PDFReportView
from rest_framework.authtoken import views

urlpatterns = [
    path('upload/', UploadView.as_view(), name='upload'),
    path('summary/', SummaryView.as_view(), name='summary'),
    path('history/', HistoryView.as_view(), name='history'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', views.obtain_auth_token, name='login'),
    path('report/<int:pk>/', PDFReportView.as_view(), name='report'),
]
