"""Suggest police station, zone, corridor, and junction from lat/lon."""
from __future__ import annotations

import math
from typing import Optional

import loader

# Bengaluru police station anchors (approx. coordinates)
POLICE_STATIONS = [
    {"name": "Cubbon Park",      "lat": 12.9740, "lng": 77.5960, "zone": "CBD 1"},
    {"name": "Indiranagar",      "lat": 12.9784, "lng": 77.6408, "zone": "East"},
    {"name": "Koramangala",      "lat": 12.9279, "lng": 77.6271, "zone": "East"},
    {"name": "Whitefield",       "lat": 12.9698, "lng": 77.7499, "zone": "East"},
    {"name": "Marathahalli",     "lat": 12.9591, "lng": 77.6974, "zone": "East"},
    {"name": "HSR Layout",       "lat": 12.9121, "lng": 77.6446, "zone": "South"},
    {"name": "JP Nagar",         "lat": 12.9067, "lng": 77.5850, "zone": "South"},
    {"name": "BTM Layout",       "lat": 12.9166, "lng": 77.6101, "zone": "South"},
    {"name": "Electronic City",  "lat": 12.8456, "lng": 77.6603, "zone": "South"},
    {"name": "Yelahanka",        "lat": 13.1007, "lng": 77.5963, "zone": "North"},
    {"name": "Hebbal",           "lat": 13.0358, "lng": 77.5970, "zone": "North"},
    {"name": "Rajajinagar",      "lat": 12.9915, "lng": 77.5544, "zone": "West"},
    {"name": "Vijayanagar",      "lat": 12.9710, "lng": 77.5370, "zone": "West"},
    {"name": "Jayanagar",        "lat": 12.9308, "lng": 77.5838, "zone": "South"},
    {"name": "Basavanagudi",     "lat": 12.9423, "lng": 77.5674, "zone": "South"},
    {"name": "KR Puram",         "lat": 13.0105, "lng": 77.6974, "zone": "East"},
    {"name": "Mahadevapura",     "lat": 12.9918, "lng": 77.6925, "zone": "East"},
    {"name": "Bommanahalli",     "lat": 12.8968, "lng": 77.6253, "zone": "South"},
]

# Major corridor / arterial road sample points
CORRIDOR_ANCHORS = [
    {"name": "ORR East 1",       "lat": 12.9590, "lng": 77.7010},
    {"name": "ORR East 2",       "lat": 12.9480, "lng": 77.7350},
    {"name": "ORR North",        "lat": 13.0200, "lng": 77.6200},
    {"name": "ORR South",        "lat": 12.8900, "lng": 77.6400},
    {"name": "ORR West",         "lat": 12.9600, "lng": 77.5200},
    {"name": "Outer Ring Road",  "lat": 12.9350, "lng": 77.6800},
    {"name": "Bellary Rd",       "lat": 13.0200, "lng": 77.5900},
    {"name": "Hosur Rd",         "lat": 12.9200, "lng": 77.6100},
    {"name": "MG Road",          "lat": 12.9750, "lng": 77.6060},
    {"name": "Old Airport Rd",   "lat": 12.9600, "lng": 77.6550},
    {"name": "Tumkur Rd",        "lat": 13.0300, "lng": 77.5500},
    {"name": "Mysore Rd",        "lat": 12.9400, "lng": 77.5300},
    {"name": "Bannerghatta Rd",  "lat": 12.9100, "lng": 77.6000},
    {"name": "NICE Road",        "lat": 12.8700, "lng": 77.5200},
]

JUNCTION_ANCHORS = [
    {"name": "Silk Board",          "lat": 12.9177, "lng": 77.6235},
    {"name": "KR Puram",            "lat": 13.0105, "lng": 77.6974},
    {"name": "Hebbal Flyover",      "lat": 13.0358, "lng": 77.5970},
    {"name": "Marathahalli Bridge", "lat": 12.9591, "lng": 77.6974},
    {"name": "Dairy Circle",        "lat": 12.9380, "lng": 77.5800},
    {"name": "Mekhri Circle",       "lat": 12.9980, "lng": 77.5840},
    {"name": "Tin Factory",         "lat": 13.0050, "lng": 77.6680},
    {"name": "Iblur",               "lat": 12.9200, "lng": 77.6650},
    {"name": "Agara",               "lat": 12.9240, "lng": 77.6380},
    {"name": "Sony World",          "lat": 12.9350, "lng": 77.6280},
    {"name": "Central Silk Board",  "lat": 12.9177, "lng": 77.6235},
]

CORRIDOR_MAX_KM = 1.8
JUNCTION_MAX_KM = 2.5


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _nearest(items: list[dict], lat: float, lng: float) -> tuple[dict, float]:
    best, best_d = items[0], float("inf")
    for item in items:
        d = _haversine_km(lat, lng, item["lat"], item["lng"])
        if d < best_d:
            best, best_d = item, d
    return best, best_d


def _valid_class(name: str, col: str) -> bool:
    encoders = loader.get("label_encoders") or {}
    le = encoders.get(col)
    if le is None:
        return True
    return name in le.classes_


def suggest_location(latitude: float, longitude: float) -> dict:
    kmeans = loader.get("kmeans")
    cluster = int(kmeans.predict([[latitude, longitude]])[0]) if kmeans else 0

    station, _ = _nearest(POLICE_STATIONS, latitude, longitude)
    police = station["name"]
    zone = station["zone"]

    if not _valid_class(police, "police_station"):
        police = "UNKNOWN"
    if not _valid_class(zone, "zone"):
        zone = "UNKNOWN"

    corridor_name: Optional[str] = None
    corr, corr_d = _nearest(CORRIDOR_ANCHORS, latitude, longitude)
    if corr_d <= CORRIDOR_MAX_KM and _valid_class(corr["name"], "corridor"):
        corridor_name = corr["name"]

    junction_name: Optional[str] = None
    junc, junc_d = _nearest(JUNCTION_ANCHORS, latitude, longitude)
    if junc_d <= JUNCTION_MAX_KM and _valid_class(junc["name"], "junction"):
        junction_name = junc["name"]

    return {
        "latitude": latitude,
        "longitude": longitude,
        "police_station": police,
        "zone": zone,
        "corridor": corridor_name,
        "junction": junction_name,
        "location_cluster": cluster,
        "is_corridor": corridor_name is not None,
    }
