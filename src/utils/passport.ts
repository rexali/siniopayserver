
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
// import Admin from '../models/admin.model';
import User from '../models/User.model';
dotenv.config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};


passport.use('user-jwt', new JwtStrategy(opts, async (payload, done) => {
  try {
    const user = await User.findByPk((payload as any).id);
    if (user) return done(null, user);
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

passport.use('admin-jwt', new JwtStrategy(opts, async (payload, done) => {
  try {
    // const admin = await Admin.findByPk((payload as any).id);
    // if (admin) return done(null, admin);
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

export default passport;
