function createDatabase(mongo, mongoUrl, id) {
  mongo.connect(
    mongoUrl + id,
    (err, db) => {
      if (err) res.send(err);
      db.close();
      res.send('Database created');
    }
  );
}
