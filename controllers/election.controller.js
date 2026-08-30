const CandidateModel = require("../models/candidates.model");
const VoterModel = require("../models/voters.model");
const OfficerModel = require("../models/officers.model");
const ElectionModel = require("../models/election.model");
const BallotModel = require("../models/ballots.model");

class ElectionController {
      static startData () {
            OfficerModel.init();
            CandidateModel.init();
            VoterModel.init();
            ElectionModel.init();
            BallotModel.init();
      }

      static home (req, res) {
            res.render("index", {
                  data: BallotModel.summary(),
                  candidates: CandidateModel.getCandidates(),
                  voters: VoterModel.getVoters(),
                  officers: OfficerModel.getOfficers()
            });
      }

      static candidates (req, res) {
            res.json(CandidateModel.getCandidates());
      }

      static voters (req, res) {
            const list = VoterModel.getVoters().map((khon) => ({
                  ...khon,
                  voted: BallotModel.hasVoted(khon.id)
            }));

            res.json(list);
      }

      static status (req, res) {
            res.json(BallotModel.summary());
      }

      static vote (req, res) {
            const body = req.body || {};
            const voterId = body.voterId || body.voter_id;
            const ranking = body.ranking || body.candidateId || body.candidate_id;
            const ans = BallotModel.voteLeaw(voterId, ranking);

            res.status(ans.success ? 200 : 400).json(ans);
      }

      static close (req, res) {
            const body = req.body || {};
            const officerId = body.officerId || body.officer_id || "O01";
            const ans = ElectionModel.close(officerId);

            if (!ans.success) {
                  res.status(400).json(ans);
                  return;
            }

            BallotModel.checkIsRepeatPattern();

            if (BallotModel.getPendingGroups().length === 0) {
                  ElectionModel.finish();
            }

            res.json({
                  ...ans,
                  summary: BallotModel.summary()
            });
      }

      static decideGroup (req, res) {
            const groupId = req.params.groupId;
            const body = req.body || {};
            let decision = body.decision || body.result;

            if (decision === "approve") decision = "รับรอง";
            if (decision === "reject") decision = "ไม่นับ";

            const ans = BallotModel.decideGroup(groupId, decision);

            res.status(ans.success ? 200 : 400).json({
                  ...ans,
                  summary: BallotModel.summary()
            });
      }
}

module.exports = ElectionController;
