## Introduction:
This is a small google cloud function to show what are the uploaded movies from last week.

## Manual Deploy:
gcloud functions deploy movie-night --region=northamerica-northeast1 --runtime=nodejs16 --source=. --entry-point=movies --trigger-topic=cron-topic

