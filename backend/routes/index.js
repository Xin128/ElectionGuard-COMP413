import ballots from '../controllers/ballotsController';

export default (app) => {
  app.route('/ballots')
    .get(ballots.getAllBallots)
    .post(ballots.createBallot);

  app.route('/ballots/:ballotId')
    .get(ballots.getBallot)
    .put(ballots.updateBallot)
    .delete(ballots.deleteBallot);
};
