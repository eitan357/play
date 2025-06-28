export const RehearsalSessionSchema = {
  name: "RehearsalSession",
  type: "object",
  properties: {
    script_id: {
      type: "string",
      description: "Reference to the script being rehearsed",
    },
    character_name: {
      type: "string",
      description: "Character the user is playing",
    },
    session_date: {
      type: "string",
      format: "date-time",
    },
    total_lines: {
      type: "number",
    },
    correct_lines: {
      type: "number",
    },
    accuracy_percentage: {
      type: "number",
    },
    line_recordings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line_number: {
            type: "number",
          },
          original_line: {
            type: "string",
          },
          spoken_line: {
            type: "string",
          },
          recording_url: {
            type: "string",
          },
          was_correct: {
            type: "boolean",
          },
          attempts: {
            type: "number",
          },
        },
      },
    },
    duration_minutes: {
      type: "number",
    },
  },
  required: ["script_id", "character_name"],
};

// RehearsalSession entity with localStorage persistence and 30-day expiration
export class RehearsalSession {
  static getStorageKey() {
    return "linecoach_sessions";
  }

  static getExpirationDays() {
    return 30; // Data expires after 30 days
  }

  static cleanExpiredData(sessions) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - this.getExpirationDays());

    return sessions.filter((session) => {
      const sessionDate = new Date(session.session_date);
      return sessionDate > expirationDate;
    });
  }

  static async list(sortBy = "-session_date", limit = null) {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      let sessions = stored ? JSON.parse(stored) : [];

      // Clean expired data
      sessions = this.cleanExpiredData(sessions);

      // Save cleaned data back to localStorage
      localStorage.setItem(this.getStorageKey(), JSON.stringify(sessions));

      // Sort sessions
      if (sortBy === "-session_date") {
        sessions.sort(
          (a, b) => new Date(b.session_date) - new Date(a.session_date)
        );
      }

      // Apply limit
      if (limit) {
        sessions = sessions.slice(0, limit);
      }

      return sessions;
    } catch (error) {
      console.error("Error loading sessions:", error);
      return [];
    }
  }

  static async create(data) {
    try {
      const sessions = await this.list();
      const newSession = {
        id: Date.now().toString(),
        ...data,
        session_date: new Date().toISOString(),
      };

      sessions.unshift(newSession); // Add to beginning
      localStorage.setItem(this.getStorageKey(), JSON.stringify(sessions));

      return newSession;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const sessions = await this.list();
      const index = sessions.findIndex((session) => session.id === id);

      if (index !== -1) {
        sessions[index] = { ...sessions[index], ...data };
        localStorage.setItem(this.getStorageKey(), JSON.stringify(sessions));
        return sessions[index];
      }

      throw new Error("Session not found");
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sessions = await this.list();
      const filteredSessions = sessions.filter((session) => session.id !== id);
      localStorage.setItem(
        this.getStorageKey(),
        JSON.stringify(filteredSessions)
      );
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
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
