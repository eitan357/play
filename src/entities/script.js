{
  "name": "Script",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Name of the script or scene"
    },
    "original_image_url": {
      "type": "string",
      "description": "URL of the uploaded script image"
    },
    "extracted_text": {
      "type": "string",
      "description": "Full text extracted from OCR"
    },
    "characters": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of character names found in script"
    },
    "dialogue_lines": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "character": {
            "type": "string"
          },
          "line": {
            "type": "string"
          },
          "line_number": {
            "type": "number"
          }
        }
      },
      "description": "Parsed dialogue broken down by character and line"
    },
    "status": {
      "type": "string",
      "enum": [
        "processing",
        "ready",
        "error"
      ],
      "default": "processing"
    }
  },
  "required": [
    "title"
  ]
}