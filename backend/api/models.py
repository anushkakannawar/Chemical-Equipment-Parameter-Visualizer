from django.db import models

class Dataset(models.Model):
    upload_date = models.DateTimeField(auto_now_add=True)
    filename = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.filename} ({self.upload_date})"

class Equipment(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='equipment')
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    flowrate = models.FloatField()
    pressure = models.FloatField()
    temperature = models.FloatField()

    def __str__(self):
        return f"{self.name} - {self.type}"
