const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        // Job title / Department role (e.g., "Product manager", "Backend engineer")
        role: {
            type: String,
            required: true,
            trim: true
        },
        // System access role (admin, manager, member, viewer)
        systemRole: {
            type: String,
            enum: ['admin', 'manager', 'member', 'viewer'],
            default: 'member'
        },
        // Granular permission keys
        permissions: {
            type: [String],
            default: ['create_tasks', 'edit_tasks', 'view_analytics']
        },
        // Account status
        status: {
            type: String,
            enum: ['active', 'suspended'],
            default: 'active'
        },
        capacity: {
            type: Number,
            default: 14
        }
    }, 
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
