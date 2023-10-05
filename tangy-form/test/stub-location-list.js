const stub = {
  "locationsLevels": ["county", "subcounty", "school"],
  "locations": {
    "county1": {
      "id": "county1",
      "label": "County 1",
      "children": {
        "subcounty1": {
          "id": "subcounty1",
          "label": "Subcounty 1",
          "children": {
            "school1": {
              "id": "school1",
              "label": "School 1",
              "latitude": 44.46567,
              "longitude": -73.21911
              },
            "school2": {
              "id": "school2",
              "label": "School 2",
              "latitude": 44.45308,
              "longitude": -73.19576
            }
          }
        },
        "subcounty2": {
          "id": "subcounty2",
          "label": "Subcounty 2",
          "children": {
            "school5": {
              "id": "school5",
              "label": "School 5",
              "latitude": 44.46567,
              "longitude": -73.21911
            },
            "school6": {
              "id": "school6",
              "label": "School 6",
              "latitude": 44.45308,
              "longitude": -73.19576
            }
          }
        }
      }
    }
  }
}
export default stub
