'use client'

/**
 * Enhanced Statistics & Reporting Engine
 * Hệ thống thống kê và báo cáo nâng cao với:
 * - Real-time statistics calculation
 * - Advanced analytics và insights
 * - Export functionality
 * - Performance metrics
 * - Trend analysis
 */

import { storage } from './storage'
import { WORK_STATUS } from '../config/appConfig'
import { formatDate } from './helpers'
import { generateWorkStatusAnalytics } from './workStatusCalculator'

class StatisticsEngine {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Generate comprehensive work statistics
   */
  async generateComprehensiveStats(startDate, endDate, options = {}) {
    try {
      console.log('[StatisticsEngine] Generating comprehensive statistics...')
      
      const cacheKey = `comprehensive_${startDate.toISOString()}_${endDate.toISOString()}`
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data
        }
      }
      
      // Generate base analytics
      const baseAnalytics = await generateWorkStatusAnalytics(startDate, endDate)
      
      // Enhanced statistics
      const enhancedStats = await this.calculateEnhancedMetrics(startDate, endDate)
      
      // Performance metrics
      const performanceMetrics = await this.calculatePerformanceMetrics(startDate, endDate)
      
      // Trend analysis
      const trendAnalysis = await this.calculateTrendAnalysis(startDate, endDate)
      
      // Attendance patterns
      const attendancePatterns = await this.analyzeAttendancePatterns(startDate, endDate)
      
      const comprehensiveStats = {
        ...baseAnalytics,
        enhanced: enhancedStats,
        performance: performanceMetrics,
        trends: trendAnalysis,
        patterns: attendancePatterns,
        generatedAt: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        }
      }
      
      // Cache results
      this.cache.set(cacheKey, {
        data: comprehensiveStats,
        timestamp: Date.now()
      })
      
      console.log('[StatisticsEngine] Comprehensive statistics generated')
      return comprehensiveStats
      
    } catch (error) {
      console.error('[StatisticsEngine] Failed to generate comprehensive stats:', error)
      return null
    }
  }

  /**
   * Calculate enhanced metrics
   */
  async calculateEnhancedMetrics(startDate, endDate) {
    try {
      const metrics = {
        productivity: {
          attendanceRate: 0,
          punctualityRate: 0,
          overtimeUtilization: 0,
          averageWorkingHours: 0,
        },
        efficiency: {
          timeUtilization: 0,
          breakTimeRatio: 0,
          workIntensity: 0,
        },
        compliance: {
          policyAdherence: 0,
          leaveBalance: 0,
          overtimeCompliance: 0,
        }
      }
      
      // Collect daily data
      const dailyData = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate)
        const status = await storage.getDailyWorkStatus(dateStr)
        
        if (status) {
          dailyData.push(status)
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      if (dailyData.length === 0) return metrics
      
      // Calculate productivity metrics
      const workDays = dailyData.filter(d => 
        [WORK_STATUS.DU_CONG, WORK_STATUS.DI_MUON, WORK_STATUS.VE_SOM, WORK_STATUS.DI_MUON_VE_SOM].includes(d.status)
      )
      
      const totalDays = dailyData.length
      const punctualDays = dailyData.filter(d => d.status === WORK_STATUS.DU_CONG).length
      const overtimeDays = dailyData.filter(d => d.otHoursScheduled > 0).length
      
      metrics.productivity.attendanceRate = (workDays.length / totalDays) * 100
      metrics.productivity.punctualityRate = (punctualDays / Math.max(workDays.length, 1)) * 100
      metrics.productivity.overtimeUtilization = (overtimeDays / Math.max(workDays.length, 1)) * 100
      
      const totalWorkHours = workDays.reduce((sum, d) => sum + (d.totalHoursScheduled || 0), 0)
      metrics.productivity.averageWorkingHours = totalWorkHours / Math.max(workDays.length, 1)
      
      // Calculate efficiency metrics
      const totalScheduledHours = workDays.reduce((sum, d) => sum + (d.standardHoursScheduled || 0), 0)
      const totalBreakHours = workDays.reduce((sum, d) => sum + ((d.breakMinutes || 0) / 60), 0)
      
      metrics.efficiency.timeUtilization = totalScheduledHours > 0 ? (totalWorkHours / totalScheduledHours) * 100 : 0
      metrics.efficiency.breakTimeRatio = totalWorkHours > 0 ? (totalBreakHours / totalWorkHours) * 100 : 0
      metrics.efficiency.workIntensity = metrics.productivity.averageWorkingHours / 8 * 100 // Assuming 8-hour standard
      
      // Calculate compliance metrics
      const lateDays = dailyData.filter(d => d.lateMinutes > 0).length
      const earlyDays = dailyData.filter(d => d.earlyMinutes > 0).length
      const violationDays = lateDays + earlyDays
      
      metrics.compliance.policyAdherence = ((workDays.length - violationDays) / Math.max(workDays.length, 1)) * 100
      
      const totalOvertimeHours = workDays.reduce((sum, d) => sum + (d.otHoursScheduled || 0), 0)
      const maxAllowedOvertime = workDays.length * 2 // Assuming 2 hours max OT per day
      metrics.compliance.overtimeCompliance = totalOvertimeHours <= maxAllowedOvertime ? 100 : (maxAllowedOvertime / totalOvertimeHours) * 100
      
      return metrics
      
    } catch (error) {
      console.error('[StatisticsEngine] Failed to calculate enhanced metrics:', error)
      return {}
    }
  }

  /**
   * Calculate performance metrics
   */
  async calculatePerformanceMetrics(startDate, endDate) {
    try {
      const metrics = {
        consistency: {
          attendanceConsistency: 0,
          timeConsistency: 0,
          patternStability: 0,
        },
        improvement: {
          punctualityTrend: 0,
          attendanceTrend: 0,
          overtimeTrend: 0,
        },
        benchmarks: {
          industryComparison: 0,
          personalBest: 0,
          teamAverage: 0,
        }
      }
      
      // Calculate consistency metrics
      const dailyData = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate)
        const status = await storage.getDailyWorkStatus(dateStr)
        
        if (status) {
          dailyData.push(status)
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      if (dailyData.length < 7) return metrics // Need at least a week of data
      
      // Attendance consistency (standard deviation of work hours)
      const workHours = dailyData
        .filter(d => d.totalHoursScheduled > 0)
        .map(d => d.totalHoursScheduled)
      
      if (workHours.length > 0) {
        const mean = workHours.reduce((a, b) => a + b, 0) / workHours.length
        const variance = workHours.reduce((sum, hours) => sum + Math.pow(hours - mean, 2), 0) / workHours.length
        const stdDev = Math.sqrt(variance)
        
        metrics.consistency.attendanceConsistency = Math.max(0, 100 - (stdDev / mean) * 100)
      }
      
      // Time consistency (check-in time variance)
      const checkInTimes = dailyData
        .filter(d => d.vaoLogTime)
        .map(d => {
          const [hours, minutes] = d.vaoLogTime.split(':').map(Number)
          return hours * 60 + minutes
        })
      
      if (checkInTimes.length > 0) {
        const mean = checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length
        const variance = checkInTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / checkInTimes.length
        const stdDev = Math.sqrt(variance)
        
        metrics.consistency.timeConsistency = Math.max(0, 100 - (stdDev / 30)) // 30 minutes tolerance
      }
      
      // Calculate improvement trends (compare first half vs second half)
      const midPoint = Math.floor(dailyData.length / 2)
      const firstHalf = dailyData.slice(0, midPoint)
      const secondHalf = dailyData.slice(midPoint)
      
      const firstHalfPunctuality = firstHalf.filter(d => d.status === WORK_STATUS.DU_CONG).length / firstHalf.length
      const secondHalfPunctuality = secondHalf.filter(d => d.status === WORK_STATUS.DU_CONG).length / secondHalf.length
      
      metrics.improvement.punctualityTrend = ((secondHalfPunctuality - firstHalfPunctuality) / Math.max(firstHalfPunctuality, 0.01)) * 100
      
      return metrics
      
    } catch (error) {
      console.error('[StatisticsEngine] Failed to calculate performance metrics:', error)
      return {}
    }
  }

  /**
   * Calculate trend analysis
   */
  async calculateTrendAnalysis(startDate, endDate) {
    try {
      const trends = {
        weekly: [],
        monthly: [],
        seasonal: {},
        predictions: {}
      }
      
      // Weekly trends
      const weeklyData = {}
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate)
        const status = await storage.getDailyWorkStatus(dateStr)
        
        if (status) {
          const weekStart = new Date(currentDate)
          weekStart.setDate(currentDate.getDate() - currentDate.getDay())
          const weekKey = formatDate(weekStart)
          
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              week: weekKey,
              workDays: 0,
              totalHours: 0,
              overtimeHours: 0,
              lateDays: 0,
              punctualDays: 0,
            }
          }
          
          if ([WORK_STATUS.DU_CONG, WORK_STATUS.DI_MUON, WORK_STATUS.VE_SOM, WORK_STATUS.DI_MUON_VE_SOM].includes(status.status)) {
            weeklyData[weekKey].workDays++
            weeklyData[weekKey].totalHours += status.totalHoursScheduled || 0
            weeklyData[weekKey].overtimeHours += status.otHoursScheduled || 0
            
            if (status.lateMinutes > 0) {
              weeklyData[weekKey].lateDays++
            }
            
            if (status.status === WORK_STATUS.DU_CONG) {
              weeklyData[weekKey].punctualDays++
            }
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      trends.weekly = Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week))
      
      // Simple trend prediction (linear regression on punctuality)
      if (trends.weekly.length >= 4) {
        const punctualityRates = trends.weekly.map(w => w.workDays > 0 ? (w.punctualDays / w.workDays) * 100 : 0)
        const slope = this.calculateLinearTrend(punctualityRates)
        
        trends.predictions.punctualityTrend = slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable'
        trends.predictions.trendStrength = Math.abs(slope)
      }
      
      return trends
      
    } catch (error) {
      console.error('[StatisticsEngine] Failed to calculate trend analysis:', error)
      return {}
    }
  }

  /**
   * Analyze attendance patterns
   */
  async analyzeAttendancePatterns(startDate, endDate) {
    try {
      const patterns = {
        dayOfWeek: {},
        timeOfDay: {},
        seasonal: {},
        anomalies: []
      }
      
      // Day of week patterns
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      dayNames.forEach(day => {
        patterns.dayOfWeek[day] = {
          workDays: 0,
          lateDays: 0,
          earlyDays: 0,
          averageHours: 0,
        }
      })
      
      const currentDate = new Date(startDate)
      const dailyData = []
      
      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate)
        const status = await storage.getDailyWorkStatus(dateStr)
        
        if (status) {
          dailyData.push({ ...status, dayOfWeek: currentDate.getDay() })
          
          const dayName = dayNames[currentDate.getDay()]
          
          if ([WORK_STATUS.DU_CONG, WORK_STATUS.DI_MUON, WORK_STATUS.VE_SOM, WORK_STATUS.DI_MUON_VE_SOM].includes(status.status)) {
            patterns.dayOfWeek[dayName].workDays++
            patterns.dayOfWeek[dayName].averageHours += status.totalHoursScheduled || 0
            
            if (status.lateMinutes > 0) {
              patterns.dayOfWeek[dayName].lateDays++
            }
            
            if (status.earlyMinutes > 0) {
              patterns.dayOfWeek[dayName].earlyDays++
            }
          }
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Calculate averages
      Object.keys(patterns.dayOfWeek).forEach(day => {
        const dayData = patterns.dayOfWeek[day]
        if (dayData.workDays > 0) {
          dayData.averageHours = dayData.averageHours / dayData.workDays
          dayData.lateRate = (dayData.lateDays / dayData.workDays) * 100
          dayData.earlyRate = (dayData.earlyDays / dayData.workDays) * 100
        }
      })
      
      // Detect anomalies (days with unusual patterns)
      const workDaysData = dailyData.filter(d => 
        [WORK_STATUS.DU_CONG, WORK_STATUS.DI_MUON, WORK_STATUS.VE_SOM, WORK_STATUS.DI_MUON_VE_SOM].includes(d.status)
      )
      
      if (workDaysData.length > 0) {
        const avgHours = workDaysData.reduce((sum, d) => sum + (d.totalHoursScheduled || 0), 0) / workDaysData.length
        const threshold = avgHours * 0.3 // 30% deviation threshold
        
        patterns.anomalies = workDaysData
          .filter(d => Math.abs((d.totalHoursScheduled || 0) - avgHours) > threshold)
          .map(d => ({
            date: d.date,
            hours: d.totalHoursScheduled,
            deviation: ((d.totalHoursScheduled || 0) - avgHours) / avgHours * 100,
            type: (d.totalHoursScheduled || 0) > avgHours ? 'high' : 'low'
          }))
      }
      
      return patterns
      
    } catch (error) {
      console.error('[StatisticsEngine] Failed to analyze attendance patterns:', error)
      return {}
    }
  }

  /**
   * Calculate linear trend (simple slope)
   */
  calculateLinearTrend(values) {
    if (values.length < 2) return 0
    
    const n = values.length
    const sumX = (n * (n - 1)) / 2 // Sum of indices 0, 1, 2, ...
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6 // Sum of squares of indices
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    return slope
  }

  /**
   * Export statistics to various formats
   */
  async exportStatistics(stats, format = 'json') {
    try {
      console.log(`[StatisticsEngine] Exporting statistics in ${format} format`)
      
      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(stats, null, 2)
          
        case 'csv':
          return this.convertToCSV(stats)
          
        case 'summary':
          return this.generateSummaryReport(stats)
          
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
      
    } catch (error) {
      console.error('[StatisticsEngine] Failed to export statistics:', error)
      return null
    }
  }

  /**
   * Convert statistics to CSV format
   */
  convertToCSV(stats) {
    const rows = []
    
    // Header
    rows.push(['Metric', 'Value', 'Category'])
    
    // Basic metrics
    rows.push(['Total Days', stats.totalDays, 'Basic'])
    rows.push(['Work Days', stats.workDays, 'Basic'])
    rows.push(['Absent Days', stats.absentDays, 'Basic'])
    rows.push(['Average Work Hours', stats.averageWorkHours?.toFixed(2), 'Basic'])
    
    // Enhanced metrics
    if (stats.enhanced?.productivity) {
      const prod = stats.enhanced.productivity
      rows.push(['Attendance Rate (%)', prod.attendanceRate?.toFixed(2), 'Productivity'])
      rows.push(['Punctuality Rate (%)', prod.punctualityRate?.toFixed(2), 'Productivity'])
      rows.push(['Overtime Utilization (%)', prod.overtimeUtilization?.toFixed(2), 'Productivity'])
    }
    
    return rows.map(row => row.join(',')).join('\n')
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(stats) {
    const lines = []
    
    lines.push('=== WORK STATISTICS SUMMARY ===')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push(`Period: ${stats.dateRange?.start} to ${stats.dateRange?.end}`)
    lines.push('')
    
    lines.push('BASIC METRICS:')
    lines.push(`- Total Days: ${stats.totalDays}`)
    lines.push(`- Work Days: ${stats.workDays}`)
    lines.push(`- Absent Days: ${stats.absentDays}`)
    lines.push(`- Average Work Hours: ${stats.averageWorkHours?.toFixed(2)}`)
    lines.push('')
    
    if (stats.enhanced?.productivity) {
      const prod = stats.enhanced.productivity
      lines.push('PRODUCTIVITY METRICS:')
      lines.push(`- Attendance Rate: ${prod.attendanceRate?.toFixed(2)}%`)
      lines.push(`- Punctuality Rate: ${prod.punctualityRate?.toFixed(2)}%`)
      lines.push(`- Overtime Utilization: ${prod.overtimeUtilization?.toFixed(2)}%`)
      lines.push('')
    }
    
    return lines.join('\n')
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
    console.log('[StatisticsEngine] Cache cleared')
  }
}

// Export singleton instance
export const statisticsEngine = new StatisticsEngine()
export default statisticsEngine
