export const ScriptSchema = {
  name: "Script",
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Name of the script or scene",
    },
    original_image_url: {
      type: "string",
      description: "URL of the uploaded script image",
    },
    extracted_text: {
      type: "string",
      description: "Full text extracted from OCR",
    },
    characters: {
      type: "array",
      items: {
        type: "string",
      },
      description: "List of character names found in script",
    },
    dialogue_lines: {
      type: "array",
      items: {
        type: "object",
        properties: {
          character: {
            type: "string",
          },
          line: {
            type: "string",
          },
          line_number: {
            type: "number",
          },
        },
      },
      description: "Parsed dialogue broken down by character and line",
    },
    status: {
      type: "string",
      enum: ["processing", "ready", "error"],
      default: "processing",
    },
  },
  required: ["title"],
};

// Script entity with localStorage persistence and 30-day expiration
export class Script {
  static getStorageKey() {
    return "linecoach_scripts";
  }

  static getExpirationDays() {
    return 30; // Data expires after 30 days
  }

  static cleanExpiredData(scripts) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - this.getExpirationDays());

    return scripts.filter((script) => {
      const scriptDate = new Date(script.created_date);
      return scriptDate > expirationDate;
    });
  }

  static async list(sortBy = "-created_date", limit = null) {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      let scripts = stored ? JSON.parse(stored) : [];

      // Clean expired data
      scripts = this.cleanExpiredData(scripts);

      // Save cleaned data back to localStorage
      localStorage.setItem(this.getStorageKey(), JSON.stringify(scripts));

      // Sort scripts
      if (sortBy === "-created_date") {
        scripts.sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );
      }

      // Apply limit
      if (limit) {
        scripts = scripts.slice(0, limit);
      }

      return scripts;
    } catch (error) {
      console.error("Error loading scripts:", error);
      return [];
    }
  }

  static async create(data) {
    try {
      const scripts = await this.list();
      const newScript = {
        id: Date.now().toString(),
        ...data,
        created_date: new Date().toISOString(),
      };

      scripts.unshift(newScript); // Add to beginning
      localStorage.setItem(this.getStorageKey(), JSON.stringify(scripts));

      return newScript;
    } catch (error) {
      console.error("Error creating script:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const scripts = await this.list();
      const index = scripts.findIndex((script) => script.id === id);

      if (index !== -1) {
        scripts[index] = { ...scripts[index], ...data };
        localStorage.setItem(this.getStorageKey(), JSON.stringify(scripts));
        return scripts[index];
      }

      throw new Error("Script not found");
    } catch (error) {
      console.error("Error updating script:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const scripts = await this.list();
      const filteredScripts = scripts.filter((script) => script.id !== id);
      localStorage.setItem(
        this.getStorageKey(),
        JSON.stringify(filteredScripts)
      );
      return true;
    } catch (error) {
      console.error("Error deleting script:", error);
      throw error;
    }
  }

  // Get data expiration info
  static getExpirationInfo() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + this.getExpirationDays());

    return {
      expiresIn: this.getExpirationDays(),
      expirationDate: expirationDate.toISOString(),
      willExpire: true,
    };
  }
}
