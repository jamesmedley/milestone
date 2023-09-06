import json
from geopy.distance import great_circle
import multiprocessing


def filter_by_population():
    """Filter out all cities with population less than 100000"""
    # worldcities.json sourec from: https://simplemaps.com/data/world-cities
    with open('worldcities.json', 'r', encoding='utf-8') as file:
        data = json.load(file)

    filtered_cities = [city for city in data if city.get('population') is not None and city['population'] >= 100000]
    with open('worldcities_filtered.json', 'w', encoding='utf-8') as file:
        json.dump(filtered_cities, file, ensure_ascii=False, indent=2)
    print(f"{len(data) - len(filtered_cities)} cities removed.")


def calculate_distance(city1, city2):
    """Calculate distance between cities"""
    coords_1 = (city1['lat'], city1['lng'])
    coords_2 = (city2['lat'], city2['lng'])
    return great_circle(coords_1, coords_2).kilometers


def calculate_distances(start, end, cities, distance_cache):
    """Find distances between each and every city. O(n^2) algorithm - implemented multithreading to speed up.
    n(n-1)/2 connections between n nodes. Calculates approx 17 million connections between all cities"""
    distances = []
    for i in range(start, end):
        print(i)
        city1 = cities[i]
        for j in range(i + 1, len(cities)):
            city2 = cities[j]
            city_pair = (city1['city'], city2['city'])
            if city_pair not in distance_cache:
                distance = calculate_distance(city1, city2)
                distance_cache[city_pair] = distance
            distances.append({
                'distance': distance_cache[city_pair],
                'city1': f"{city1['city']}, {city1['country']}",
                'city2': f"{city2['city']}, {city2['country']}"
            })
    return distances


if __name__ == "__main__":
    with open('worldcities_filtered.json', 'r', encoding='utf-8') as file:
        filtered_cities = json.load(file)

    num_cpus = multiprocessing.cpu_count()
    chunk_size = len(filtered_cities) // num_cpus

    manager = multiprocessing.Manager()
    distance_cache = manager.dict()

    pool = multiprocessing.Pool(processes=num_cpus)

    start = 0
    end = chunk_size

    results = []

    for _ in range(num_cpus):
        result = pool.apply_async(calculate_distances, (start, end, filtered_cities, distance_cache))
        results.append(result)
        start = end
        end = start + chunk_size

    pool.close()
    pool.join()

    city_distances = []

    for result in results:
        city_distances.extend(result.get())

    # Sort the distances by distance value
    sorted_city_distances = sorted(city_distances, key=lambda x: x['distance'])
    with open("cities_by_distance.json", 'w', encoding='utf-8') as file:
        json.dump(sorted_city_distances, file, ensure_ascii=False, indent=2)





