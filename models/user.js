const db = require("../db");
const ExpressError = require("../expressError"); 


class User {
  
  static async register({ username, password, first_name, last_name, phone }) {
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at) 
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING username, password, first_name, last_name, phone, join_at`,
      [username, password, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    
    const user = result.rows[0];
    
    if (user) {
      if (user.password === password) {  
        return true;
      }
    }
    
    return false;
  }

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING username`,
      [username]
    );
    
    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${username}`);
    }
  }

  static async all() {
    const result = await db.query(`SELECT username, first_name, last_name, phone FROM users`);
    return result.rows;
  }

  static async get(username) {
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username = $1`,
      [username]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      throw new ExpressError(`No such user: ${username}`);
    }
    
    return user;
  }

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id, 
              u.username, 
              u.first_name, 
              u.last_name, 
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
       FROM messages m
       JOIN users u ON u.username = m.to_username
       WHERE m.from_username = $1`,
      [username]
    );
    
    return result.rows.map(msg => ({
      id: msg.id,
      to_user: {
        username: msg.username,
        first_name: msg.first_name,
        last_name: msg.last_name,
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at
    }));
  }

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id, 
              u.username, 
              u.first_name, 
              u.last_name, 
              u.phone,
              m.body,
              m.sent_at,
              m.read_at
       FROM messages m
       JOIN users u ON u.username = m.from_username
       WHERE m.to_username = $1`,
      [username]
    );

    return result.rows.map(msg => ({
      id: msg.id,
      from_user: {
        username: msg.username,
        first_name: msg.first_name,
        last_name: msg.last_name,
        phone: msg.phone
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at
    }));
  }
}

module.exports = User;
