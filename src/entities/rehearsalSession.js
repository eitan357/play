{
  "name": "RehearsalSession",
  "type": "object",
  "properties": {
    "script_id": {
      "type": "string",
      "description": "Reference to the script being rehearsed"
    },
    "character_name": {
      "type": "string",
      "description": "Character the user is playing"
    },
    "session_date": {
      "type": "string",
      "format": "date-time"
    },
    "total_lines": {
      "type": "number"
    },
    "correct_lines": {
      "type": "number"
    },
    "accuracy_percentage": {
      "type": "number"
    },
    "line_recordings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "line_number": {
            "type": "number"
          },
          "original_line": {
            "type": "string"
          },
          "spoken_line": {
            "type": "string"
          },
          "recording_url": {
            "type": "string"
          },
          "was_correct": {
            "type": "boolean"
          },
          "attempts": {
            "type": "number"
          }
        }
      }
    },
    "duration_minutes": {
      "type": "number"
    }
  },
  "required": [
    "script_id",
    "character_name"
  ]
}