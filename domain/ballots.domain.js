class Ballot {
      constructor (id, voter_id, ranking=[], status="บันทึกแล้ว", pattern_key=null) {
            this.id = id;
            this.voter_id = voter_id;
            this.ranking = ranking;
            this.status = status;
            this.pattern_key = pattern_key;
      }
      
}

module.exports = Ballot;
