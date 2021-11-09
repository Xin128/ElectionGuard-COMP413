import mongoose from 'mongoose';
import ballot from '../models/ballotModel.js';

exports.getBallot = (req, res) => {
  ballot.findById(req.params.ballotId, (err, ballot) => {
    if (err) {
      res.send(err);
    }

    res.json(ballot);
  });
};

exports.getAllBallots = (req, res) => {
  ballot.find({}, (err, ballot) => {
    if (err) {
      res.send(err);
    }

    res.json(ballot);
  });
};

exports.createBallot = (req, res) => {
  const newBallot = new ballot(req.body);

  newBallot.save((err, ballot) => {
    if (err) {
      res.send(err);
    }

    res.json(ballot);
  });
};

exports.updateBallot = (req, res) => {
  ballot.findOneAndUpdate({
      _id: req.params.ballotId
    }, req.body,
    (err, ballot) => {
      if (err) {
        res.send(err);
      }

      res.json(ballot);
    });
};

exports.deleteBallot = (req, res) => {
  ballot.remove({
    _id: req.params.ballotId
  }, (err) => {
    if (err) {
      res.send(err);
    }

    res.json({
      message: `ballot ${req.params.ballotId} successfully deleted`
    });
  });
};
