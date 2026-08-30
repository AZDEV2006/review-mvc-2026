const Officer = require("../domain/officers.domain");
const path = require('path');
const fs = require('fs');

class OfficerModel {
      static officers = [];

      static init () {
            try {
                  const pathFile = path.join(__dirname, "../seed_data.json");
                  const rawData = fs.readFileSync(pathFile, "utf-8");
                  const data = JSON.parse(rawData);
                  
                  this.officers = data.officers.map((d) => new Officer(d.id, d.name));
            } catch (error) {
                  if (error) throw console.error(error);
            }
      }

      static getOfficers () {
            return this.officers;
      }

      static getOfficerById (officerId) {
            return this.officers.find((d) => d.id == officerId);
      }
}

module.exports = OfficerModel;
