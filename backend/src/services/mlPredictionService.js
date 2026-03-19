import axios from 'axios';
import {
  calculateRiskScore,
  getRiskLevel,
  getRiskRecommendation,
  getRiskFactors,
} from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * ML Prediction Service
 * Handles communication with Python ML model API
 */
class MLPredictionService {
  constructor() {
    // ML API endpoint - can be configured via environment variable
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:5000/predict';
    this.useFallback = process.env.USE_FALLBACK_PREDICTION === 'true' || false;
  }

  /**
   * Get prediction from ML model or use fallback calculation
   * @param {Object} studentData - Student academic and behavioral data
   * @returns {Promise<Object>} Prediction result
   */
  async getPrediction(studentData) {
    try {
      // Try to use external ML API first
      if (!this.useFallback) {
        try {
          const prediction = await this.callMLAPI(studentData);
          return prediction;
        } catch (apiError) {
          logger.warn('ML API call failed, using fallback calculation', apiError.message);
          // Fall back to internal calculation if API fails
          return this.getFallbackPrediction(studentData);
        }
      }

      // Use fallback calculation if configured
      return this.getFallbackPrediction(studentData);
    } catch (error) {
      logger.error('Prediction service error:', error);
      throw error;
    }
  }

  /**
   * Call external ML API for prediction
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} API prediction result
   */
  async callMLAPI(studentData) {
    try {
      const payload = {
        attendance: studentData.attendancePercentage,
        marks: studentData.internalMarks,
        assignmentCompletion: studentData.assignmentCompletion,
        familyIncome: studentData.familyIncome,
        travelDistance: studentData.travelDistance,
        failures: studentData.previousFailures,
        engagementScore: studentData.engagementScore,
        // new fields
        scholarshipStatus: studentData.scholarshipStatus,
        partTimeJob: studentData.partTimeJob,
        numberOfDependents: studentData.numberOfDependents,
        disciplinaryActions: studentData.disciplinaryActions,
        socialMediaHours: studentData.socialMediaHours,
        extracurricularParticipation: studentData.extracurricularParticipation,
        hasChronicIllness: studentData.hasChronicIllness,
        mentalHealthConcern: studentData.mentalHealthConcern,
        missedDueMedical: studentData.missedDueMedical,
      };

      logger.info('Calling ML API:', this.mlApiUrl);

      const response = await axios.post(this.mlApiUrl, payload, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' },
      });

      const { risk_score, risk_level } = response.data;
      const { factors, counselorType, breakdown } = getRiskFactors(studentData);

      return {
        riskScore: risk_score,
        riskLevel: risk_level,
        recommendation: getRiskRecommendation(risk_level),
        riskFactors: factors,
        counselorType,
        breakdown,
        source: 'ml_api',
      };
    } catch (error) {
      logger.error('ML API error:', error.message);
      throw error;
    }
  }

  /**
   * Fallback prediction using internal calculation
   * @param {Object} studentData - Student data
   * @returns {Object} Prediction result
   */
  getFallbackPrediction(studentData) {
    const riskScore = calculateRiskScore(studentData);
    const riskLevel = getRiskLevel(riskScore);
    const recommendation = getRiskRecommendation(riskLevel);
    const { factors, counselorType, breakdown } = getRiskFactors(studentData);

    logger.info('Using fallback prediction calculation');

    return {
      riskScore,
      riskLevel,
      recommendation,
      riskFactors: factors,
      counselorType,
      breakdown,
      source: 'fallback',
    };
  }

  /**
   * Batch prediction for multiple students
   * @param {Array} studentsData - Array of student data
   * @returns {Promise<Array>} Array of prediction results
   */
  async batchPredict(studentsData) {
    try {
      const predictions = await Promise.all(
        studentsData.map((student) => this.getPrediction(student))
      );

      return predictions;
    } catch (error) {
      logger.error('Batch prediction error:', error);
      throw error;
    }
  }
}

export default new MLPredictionService();
