import SkillRequest from '../models/SkillRequest.js'
import ApiError from '../utils/ApiError.js'

/**
 * @desc    Submit custom skill request(s) during registration
 * @route   POST /api/skill-requests
 * @access  Public (called after electrician registration)
 */
export const createSkillRequests = async (req, res, next) => {
  try {
    const { skills, electricianId, electricianName } = req.body

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw ApiError.badRequest('At least one skill is required')
    }
    if (!electricianId) {
      throw ApiError.badRequest('Electrician ID is required')
    }

    const docs = skills.map(skillName => ({
      skillName: skillName.trim(),
      requestedBy: electricianId,
      requestedByName: electricianName || '',
      status: 'pending',
    }))

    // Use ordered:false to skip duplicates
    const result = await SkillRequest.insertMany(docs, { ordered: false }).catch(err => {
      if (err.code === 11000 || err.writeErrors) {
        return { insertedCount: err.result?.nInserted || 0 }
      }
      throw err
    })

    res.status(201).json({
      success: true,
      message: `${Array.isArray(result) ? result.length : result.insertedCount} skill request(s) submitted`,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get all skill requests (admin)
 * @route   GET /api/admin/skill-requests
 * @access  Admin
 */
export const getAllSkillRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const filter = {}
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [requests, total, pendingCount] = await Promise.all([
      SkillRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('requestedBy', 'name mobile')
        .populate('reviewedBy', 'name'),
      SkillRequest.countDocuments(filter),
      SkillRequest.countDocuments({ status: 'pending' }),
    ])

    res.json({
      success: true,
      count: requests.length,
      total,
      pendingCount,
      page: parseInt(page),
      requests,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Approve/reject a skill request (admin)
 * @route   PATCH /api/admin/skill-requests/:id
 * @access  Admin
 */
export const reviewSkillRequest = async (req, res, next) => {
  try {
    const { status, note } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      throw ApiError.badRequest('Status must be approved or rejected')
    }

    const request = await SkillRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        note: note || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    )

    if (!request) throw ApiError.notFound('Skill request not found')

    res.json({
      success: true,
      message: `Skill request ${status}`,
      request,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @desc    Get pending skill request count (for notification badge)
 * @route   GET /api/admin/skill-requests/count
 * @access  Admin
 */
export const getPendingSkillCount = async (req, res, next) => {
  try {
    const count = await SkillRequest.countDocuments({ status: 'pending' })
    res.json({ success: true, count })
  } catch (error) {
    next(error)
  }
}
