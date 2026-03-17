const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING(255), unique: true, allowNull: false, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('super_admin', 'hr_admin', 'manager', 'employee'), defaultValue: 'employee' },
  employeeId: { type: DataTypes.UUID },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE },
  refreshToken: { type: DataTypes.TEXT },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => { if (user.password) user.password = await bcrypt.hash(user.password, 12); },
    beforeUpdate: async (user) => { if (user.changed('password')) user.password = await bcrypt.hash(user.password, 12); },
  },
});
User.prototype.comparePassword = async function(pw) { return bcrypt.compare(pw, this.password); };
User.prototype.toJSON = function() { const v = { ...this.get() }; delete v.password; delete v.refreshToken; return v; };
module.exports = User;
