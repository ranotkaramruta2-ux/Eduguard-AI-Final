import twilioConfig from '../config/twilio.js';
import logger from '../utils/logger.js';

/**
 * Twilio Service
 * Handles SMS and WhatsApp notifications
 */
class TwilioService {
  constructor() {
    this.client = twilioConfig.client;
    this.phoneNumber = twilioConfig.phoneNumber;
    this.isConfigured = twilioConfig.isConfigured;
  }

  /**
   * Send SMS notification
   * @param {String} to - Recipient phone number
   * @param {String} message - Message content
   * @returns {Promise<Object>} Twilio response
   */
  async sendSMS(to, message) {
    if (!this.isConfigured) {
      logger.warn('Twilio not configured. SMS not sent.');
      return { success: false, message: 'Twilio not configured' };
    }

    try {
      const response = await this.client.messages.create({
        body: message,
        from: this.phoneNumber,
        to: to,
      });

      logger.success(`SMS sent to ${to}. SID: ${response.sid}`);

      return {
        success: true,
        messageSid: response.sid,
        status: response.status,
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   * @param {String} to - Recipient WhatsApp number (format: whatsapp:+1234567890)
   * @param {String} message - Message content
   * @returns {Promise<Object>} Twilio response
   */
  async sendWhatsApp(to, message) {
    if (!this.isConfigured) {
      logger.warn('Twilio not configured. WhatsApp message not sent.');
      return { success: false, message: 'Twilio not configured' };
    }

    try {
      // Ensure proper WhatsApp format
      const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const whatsappFrom = this.phoneNumber.startsWith('whatsapp:')
        ? this.phoneNumber
        : `whatsapp:${this.phoneNumber}`;

      const response = await this.client.messages.create({
        body: message,
        from: whatsappFrom,
        to: whatsappTo,
      });

      logger.success(`WhatsApp message sent to ${to}. SID: ${response.sid}`);

      return {
        success: true,
        messageSid: response.sid,
        status: response.status,
      };
    } catch (error) {
      logger.error(`Failed to send WhatsApp message to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Send high-risk student alert to teacher, counselor, and student
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Notification results
   */
  async sendHighRiskAlert(data) {
    const { studentName, studentPhone, teacherPhone, counselorPhone, riskScore } = data;

    const results = {
      student: null,
      teacher: null,
      counselor: null,
    };

    try {
      // Message templates
      const studentMessage = `Alert: You have been identified as a high-risk student (Risk Score: ${riskScore}). A counselor will be assigned to you soon. Please check your portal for more details.`;
      
      const teacherMessage = `High-Risk Alert: Student ${studentName} has been identified with a risk score of ${riskScore}. Immediate attention required.`;
      
      const counselorMessage = `New Assignment: High-risk student ${studentName} (Risk Score: ${riskScore}) has been assigned to you. Please review and schedule counseling session.`;

      // Send to student
      if (studentPhone) {
        try {
          results.student = await this.sendSMS(studentPhone, studentMessage);
        } catch (error) {
          logger.error('Failed to send SMS to student:', error.message);
        }
      }

      // Send to teacher
      if (teacherPhone) {
        try {
          results.teacher = await this.sendSMS(teacherPhone, teacherMessage);
        } catch (error) {
          logger.error('Failed to send SMS to teacher:', error.message);
        }
      }

      // Send to counselor
      if (counselorPhone) {
        try {
          results.counselor = await this.sendSMS(counselorPhone, counselorMessage);
        } catch (error) {
          logger.error('Failed to send SMS to counselor:', error.message);
        }
      }

      return results;
    } catch (error) {
      logger.error('High-risk alert notification error:', error);
      throw error;
    }
  }

  /**
   * Send counselor assignment notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} Notification results
   */
  async sendCounselorAssignmentAlert(data) {
    const { studentName, studentPhone, counselorName, counselorPhone } = data;

    const results = {
      student: null,
      counselor: null,
    };

    try {
      const studentMessage = `Good news! ${counselorName} has been assigned as your counselor. They will contact you soon to schedule a session.`;
      
      const counselorMessage = `New student assigned: ${studentName}. Please review their profile and schedule an initial counseling session.`;

      if (studentPhone) {
        try {
          results.student = await this.sendSMS(studentPhone, studentMessage);
        } catch (error) {
          logger.error('Failed to send SMS to student:', error.message);
        }
      }

      if (counselorPhone) {
        try {
          results.counselor = await this.sendSMS(counselorPhone, counselorMessage);
        } catch (error) {
          logger.error('Failed to send SMS to counselor:', error.message);
        }
      }

      return results;
    } catch (error) {
      logger.error('Counselor assignment notification error:', error);
      throw error;
    }
  }
}

export default new TwilioService();
