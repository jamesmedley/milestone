import json
import os
# Load the JSON file
with open('reduced_cities_by_distance.json', 'r', encoding='utf-8') as input_file:
    data = json.load(input_file)

# Initialize a dictionary to store unique distances and their corresponding objects
unique_distances = {}

# Iterate through the data and keep track of unique distances
filtered_data = []
for item in data:
    distance = item['distance']
    if distance not in unique_distances:
        unique_distances[distance] = True
        filtered_data.append(item)

# Write the modified data to a new file
with open('reduced_cities_by_distance.json', 'w', encoding='utf-8') as output_file:
    json.dump(filtered_data, output_file)

print(f"Original number of objects: {len(data)}")
print(f"Number of objects after filtering: {len(filtered_data)}")

print("New JSON file size:", os.path.getsize('reduced_cities_by_distance.json'))
