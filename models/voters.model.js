const Voter = require("../domain/voters.domain");
const path = require('path');
const fs = require('fs');

class VoterModel {
      static voters = [];

      static init () {
            try {
                  const pathFile = path.join(__dirname, "../seed_data.json");
                  const rawData = fs.readFileSync(pathFile, "utf-8");
                  const data = JSON.parse(rawData);
                  
                  this.voters = data.voters.map((d) => new Voter(d.id, d.name, d.active));
            } catch (error) {
                  if (error) throw console.error(error);
            }
      }

      static getAllVoter () {
            return this.voters;
      }

      static getVoters () {
            return this.voters;
      }

      static getVoterById (voterId) {
            return this.voters.find((d) => d.id == voterId);
      }

      static isActive (voterId) {
            const khon = this.getVoterById(voterId);
            return !!(khon && khon.active);
      }

      static IsActive (voterId) {
            return this.isActive(voterId);
      }
}

module.exports = VoterModel;
