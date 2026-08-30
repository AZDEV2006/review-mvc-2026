const Candidate = require("../domain/candidates.domain");
const path = require('path');
const fs = require('fs');

class CandidateModel {
      static candidates = [];

      static init () {
            try {
                  const pathFile = path.join(__dirname, "../seed_data.json");
                  const rawData = fs.readFileSync(pathFile, "utf-8");
                  const data = JSON.parse(rawData);
                  
                  this.candidates = data.candidates.map((d) => new Candidate(d.id, d.name));
            } catch (error) {
                  if (error) throw console.error(error);
            }
      }

      static getCandidates () {
            return this.candidates;
      }


      static getCandidateById (candidateId) {
            return this.candidates.find((d) => d.id == candidateId);
      }
}

module.exports = CandidateModel;