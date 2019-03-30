require('../core/database/database');
const User = require('../core/database/models/User');

const run = async () => {
  const users = await User.find();

  for (const user of users) {
    const { uid, metadata } = user;
    const { exercise_points, completed_exercises } = metadata;

    await User.updateOne(
      { uid },
      {
        $set: {
          'metadata.ratio': (
            parseFloat(exercise_points) / parseFloat(completed_exercises)
          ).toFixed(2),
          allow_leaderboard: false
        }
      }
    );
  }

  process.exit();
};

run();
