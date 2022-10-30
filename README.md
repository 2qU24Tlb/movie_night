## Introduction:
This is a small google cloud function to show what are the uploaded movies from last week.

## Deploy:
gcloud functions deploy movie-night --region=northamerica-northeast1 --runtime=nodejs16 --source=. --entry-point=movies --trigger-topic=cron-topic

#TODOs:
- list movies uploaded last week  [v]
- send email for these movies [v]
- search google for name and douban link [v]
- connect douban API to get image, description, rate [v]
- Add CI/CD from github.

