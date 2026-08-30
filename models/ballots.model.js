const Ballot = require("../domain/ballots.domain");
const VoterModel = require("../models/voters.model");

const CandidateModel = require("../models/candidates.model")
const ElectionModel = require("../models/election.model");

const path = require('path');
const fs = require('fs');

class BallotModel {
      static ballots = [];
      static ballots_repeatpattern = {};

      static init () {
            try {
                  const pathFile = path.join(__dirname, "../seed_data.json");
                  const rawData = fs.readFileSync(pathFile, "utf-8");
                  const data = JSON.parse(rawData);
                  
                  this.ballots = data.ballots.map((d) => new Ballot(d.id, d.voter_id, d.ranking));
                  this.ballots_repeatpattern = {};
            } catch (error) {
                  if (error) throw console.error(error);
            }
      }

      static getAllBallot () {
            return this.ballots;
      }

      static getBallotById (ballotsId) {
            return this.ballots.find((b) => b.id == ballotsId);
      }
      
      static getBallotByVoterId (voterId) {
            return this.ballots.find((b) => b.voter_id == voterId);
      }

      static hasVoted (voterId) {
            return this.ballots.some((bai) => bai.voter_id == voterId);
      }

      static makeBallotId () {
            let numMak = 0;

            this.ballots.forEach((bai) => {
                  const num = Number(String(bai.id).replace("B", ""));
                  if (num > numMak) numMak = num;
            });

            return `B${String(numMak + 1).padStart(2, "0")}`;
      }

      static checkIsRepeatPattern () {
            const box = {};
            const limit = ElectionModel.getRepeatLimit();

            this.ballots.forEach((bai) => {
                  const pattern = bai.ranking.join(">");

                  if (!box[pattern]) {
                        box[pattern] = {
                              id: pattern,
                              pattern_key: pattern,
                              ranking : bai.ranking,
                              ballots: [],
                              status: "รับรองแล้ว",
                              decision: "รับรอง"
                        }
                  }

                  box[pattern].ballots.push(bai);
            });
      
            for (const key in box) {
                  const gump = box[key];
                  const statusKub = gump.ballots.length >= limit ? "รอตรวจสอบ" : "รับรองแล้ว";

                  gump.status = statusKub;
                  gump.decision = statusKub === "รอตรวจสอบ" ? null : "รับรอง";
                  gump.ballots.forEach((bai) => {
                        bai.status = statusKub;
                        bai.pattern_key = key;
                  });
            }

            this.ballots_repeatpattern = box;
            return this.ballots_repeatpattern;
      }

      static getRepeatGroups () {
            return Object.values(this.ballots_repeatpattern);
      }

      static getPendingGroups () {
            return this.getRepeatGroups().filter((gump) => gump.status === "รอตรวจสอบ");
      }

      static decideGroup (groupId, decision) {
            const voteStatus = ElectionModel.getStatus();

            if (voteStatus === "สรุปผลแล้ว") {
                  return { success: false, message: "ปฏิเสธ: สรุปผลแล้ว แก้ไม่ได้แล้ว" };
            }

            const gump = this.ballots_repeatpattern[groupId];

            if (!gump) {
                  return { success: false, message: "ปฏิเสธ: ไม่เจอกลุ่มบัตรนี้" };
            }

            if (gump.status !== "รอตรวจสอบ") {
                  return { success: false, message: "ปฏิเสธ: กลุ่มนี้ไม่ได้รอตรวจสอบ" };
            }

            if (decision !== "รับรอง" && decision !== "ไม่นับ") {
                  return { success: false, message: "ปฏิเสธ: เลือกได้แค่ รับรอง หรือ ไม่นับ" };
            }

            const newStatus = decision === "รับรอง" ? "รับรองแล้ว" : "ไม่นับ";
            gump.status = newStatus;
            gump.decision = decision;
            gump.ballots.forEach((bai) => {
                  bai.status = newStatus;
            });

            if (this.getPendingGroups().length === 0) {
                  ElectionModel.finish();
            }

            return { success: true, message: `ตัดสินกลุ่ม ${groupId} เป็น ${decision} แล้ว`, group: gump };
      }

      static scoreBoard () {
            const scoreboard = {};
            const pointList = ElectionModel.getPoint();

            CandidateModel.getCandidates().forEach((ca) => {
                  scoreboard[ca.id] = {
                        candidate_id: ca.id,
                        name: ca.name,
                        score: 0
                  };
            });

            this.ballots
                  .filter((bai) => bai.status === "รับรองแล้ว")
                  .forEach((bai) => {
                        bai.ranking.forEach((candidateId, i) => {
                              if (scoreboard[candidateId]) {
                                    scoreboard[candidateId].score += pointList[i] || 0;
                              }
                        });
                  });

            return Object.values(scoreboard);
      }

      static countBallotStatus () {
            const ans = {
                  all: this.ballots.length,
                  counted: 0,
                  rejected: 0,
                  pending: 0
            };

            this.ballots.forEach((bai) => {
                  if (bai.status === "รับรองแล้ว") ans.counted += 1;
                  if (bai.status === "ไม่นับ") ans.rejected += 1;
                  if (bai.status === "รอตรวจสอบ") ans.pending += 1;
            });

            return ans;
      }

      static summary () {
            return {
                  election: ElectionModel.getElection(),
                  ballot_count: this.ballots.length,
                  ballot_status: this.countBallotStatus(),
                  pending_groups: this.getPendingGroups(),
                  groups: this.getRepeatGroups(),
                  scores: this.scoreBoard(),
                  ballots: this.ballots
            };
      }

      static voteLeaw (voterId, candidateId) {
            try {

                  if (ElectionModel.getStatus() !== "OPEN") {
                        throw new Error("ปฏิเสธ: การเลือกตั้งไม่ได้อยู่ในสถานะ OPEN");
                  }

                  if (!Array.isArray(candidateId) || candidateId.length != 3) {
                        throw new Error("ปฏิเสธ: ต้องเลือกผู้สมัครให้ครบ 3 คน");
                  }

                  const voter = VoterModel.getVoterById(voterId);

                  if (!voter) {
                        throw new Error("ปฏิเสธ: ไม่พบผู้มีสิทธิ์เลือกตั้ง");
                  }

                  if (!VoterModel.isActive(voterId)) {
                        throw new Error("ปฏิเสธ: ผู้มีสิทธิ์เลือกตั้งไม่ Active");
                  }

                  const uq = new Set(candidateId);
                  if (uq.size !== 3) {
                        throw new Error("ปฏิเสธ: ไม่สามารถเลือกผู้สมัครซ้ำกันในบัตรใบเดียวกันได้");
                  }

                  const hasVoted = this.hasVoted(voterId);

                  if (hasVoted) {
                        throw new Error("ปฏิเสธ: ผู้มีสิทธิ์ท่านนี้เคยลงคะแนนแล้ว");
                  }

                  for (const cId of candidateId) {
                        const ca = CandidateModel.getCandidateById(cId);
                        if (!ca) {
                              throw new Error(`ปฏิเสธ: ไม่พบผู้สมัครรหัส ${cId} ในระบบ`);
                        }
                  }

                  const newBallotId = this.makeBallotId();
                  const newBallot = new Ballot(newBallotId, voterId, candidateId);
                  this.ballots.push(newBallot);

                  return {success: true, message : "ลงคะแนนสำเร็จ", ballot: newBallot}
            } catch (error) {
                  return {success: false, message: error.message}
            }
      }
}

module.exports = BallotModel;
