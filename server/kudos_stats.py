import requests
import os
from authlib.integrations.requests_client import OAuth2Session
from dotenv import load_dotenv

load_dotenv()
client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
#strava = OAuth2Session(client_id, client_secret)
#authorization_url, state = strava.create_authorization_url(f'http://www.strava.com/oauth/authorize?client_id={client_id}&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=read')
#print(authorization_url)
#authorization_response = input('Enter the full callback URL after authorization: ')
#access_token = strava.fetch_access_token(authorization_response)
access_token = os.getenv("ACCESS_TOKEN")

athlete_id = '63721242'
endpoint_url = "https://kodos.strava.com/kodos"
headers = {
    'Authorization': f'Bearer {access_token}'
}
response = requests.get(endpoint_url, headers=headers)
print(response.content)
if response.status_code == 200:
    kudos_data = response.json()
    total_kudos_given = kudos_data["stats"]["totalGiven"]
    print(f'Total Kudos given by Athlete {athlete_id}: {total_kudos_given}')
else:
    print(f'Failed to fetch kudos. Status code: {response.status_code}')

