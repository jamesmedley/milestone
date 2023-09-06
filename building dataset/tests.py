import json

with open('cities_by_distance.json', 'r', encoding='utf-8') as file:
    data = json.load(file)

values = [item['distance'] for item in data]


def find_closest_value_index(arr, target):
    """binary search - quick enough"""
    left, right = 0, len(arr) - 1
    closest_index = None
    while left <= right:
        mid = (left + right) // 2
        mid_value = arr[mid]
        if mid_value == target:
            return mid
        if closest_index is None or abs(mid_value - target) < abs(arr[closest_index] - target):
            closest_index = mid
        if mid_value < target:
            left = mid + 1
        else:
            right = mid - 1
    return closest_index

# Example usage:
distance_to_query = 1692.6
index = find_closest_value_index(values, distance_to_query)
print(f"Closest value index to {distance_to_query} is {index}")
print(f"Closest fitting city-city journey is {data[index]}")



