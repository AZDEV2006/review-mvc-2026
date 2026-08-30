const OfficerModel = require("./officers.model");
const path = require("path");
const fs = require("fs");


class ElectionModel {
      static election = {};

      static init () {
            try {
                  const pathFile = path.join(__dirname, "../seed_data.json");
                  const rawData = fs.readFileSync(pathFile, "utf-8");
                  const data = JSON.parse(rawData);
                  
                  this.election.id = data.election.id;
                  this.election.title = data.election.title;
                  this.election.status = data.election.status;
                  this.election.ranking_points = data.election.ranking_points;
                  this.election.duplicate_pattern_threshold = data.election.duplicate_pattern_threshold;
                  this.election.closed_by = null;
                  this.election.finished_at = null;
            } catch (error) {
                  if (error) throw console.error(error);
            }
      }

      static getElection () {
            return this.election;
      }

      static getStatus () {
            return this.election.status;
      }

      static getPoint () {
            return this.election.ranking_points || [3, 2, 1];
      }

      static getRepeatLimit () {
            return this.election.duplicate_pattern_threshold || 3;
      }

      static close (officerId) {
            const staff = OfficerModel.getOfficerById(officerId);

            if (!staff) {
                  return { success: false, message: "ปฏิเสธ: ไม่พบเจ้าหน้าที่คนนี้" };
            }

            if (this.election.status !== "OPEN") {
                  return { success: false, message: "ปฏิเสธ: ปิดรับคะแนนไปแล้ว" };
            }

            this.election.status = "CLOSED";
            this.election.closed_by = staff.id;

            return { success: true, message: "ปิดรับคะแนนแล้ว", officer: staff };
      }

      static finish () {
            if (this.election.status === "สรุปผลแล้ว") {
                  return { success: false, message: "ปฏิเสธ: สรุปผลไปแล้ว" };
            }

            this.election.status = "สรุปผลแล้ว";
            this.election.finished_at = new Date().toISOString();

            return { success: true, message: "สรุปผลแล้ว" };
      }
}

module.exports = ElectionModel;
