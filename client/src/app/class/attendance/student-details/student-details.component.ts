import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DashboardService} from "../../_services/dashboard.service";
import {DateTime, Info, Interval, Settings} from "luxon";
import {KeyValue} from "@angular/common";
import {VariableService} from "../../../shared/_services/variable.service";

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {
  
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<StudentDetailsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private appConfigService: AppConfigService,
    private dashboardService: DashboardService,
    private variableService: VariableService,
  ) {
  }

  units: string[] = []
  unitDates = []
  showCalendar: boolean = false
  absentRecords: any[] = []
  curriculumLabel: string
  ignoreCurriculumsForTracking: boolean = false
  viewDate: Date = new Date();
  absences: {}
  // locale: string = 'es_GT';
  // locale: string = 'es-GT';
  locale: string = '';
  weekdays: string[] = []
  
  async ngOnInit(): Promise<void> {
    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    const languageCode = await this.variableService.get('languageCode')
    this.locale = languageCode.replace('_', '-')
    Settings.defaultLocale = this.locale
    this.showCalendar = appConfig.teachProperties?.showAttendanceCalendar
    this.units = appConfig.teachProperties?.units
    this.unitDates = appConfig.teachProperties?.unitDates
    this.unitDates.forEach((unitDate, index) => {
      const start = DateTime.fromFormat(unitDate.start, 'yyyy-MM-dd')
      const end = DateTime.fromFormat(unitDate.end, 'yyyy-MM-dd')
      const interval = Interval.fromDateTimes(start, end)
      unitDate.interval = interval
      unitDate.color = 'unit'+(index+1)
      const startLocaltime = start.toLocaleString(DateTime.DATE_MED)
      const endLocaltime = end.toLocaleString(DateTime.DATE_MED)
      unitDate.startLocaltime = startLocaltime
      unitDate.endLocaltime = endLocaltime
    })
    this.weekdays = Info.weekdays('narrow', { locale: this.locale })
    // this.weekdays = Info.weekdays('narrow')
    const currentClass = this.data.currentClass
    this.ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)

    let curriculumLabel = this.data.curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    this.curriculumLabel = curriculumLabel
    const randomId = this.data.currentClass.metadata?.randomId
    const student = this.data.student
    const studentId = student.id

    const records = []
    const events = []
    const absences = {}
    
    // setup calendar
    const firstUnitDateStart = DateTime.fromFormat(this.unitDates[0].start, 'yyyy-MM-dd')
    const lastUnitDateEnd = DateTime.fromFormat(this.unitDates[this.unitDates.length-1].end, 'yyyy-MM-dd')
    const duration = lastUnitDateEnd.diff(firstUnitDateStart, ['months']).toObject()
    const durationMonths  = Math.ceil(duration.months)
    // const dt = DateTime.now();
    const month = lastUnitDateEnd.month;
    // for (let i = 0; i < 6; i++) {
    for (let i = (durationMonths - 1); i >= 0; i--) {  // looping in reverse
      const monthDate = lastUnitDateEnd.set({month: month - i, day: 1})
      const monthinFutureDate = lastUnitDateEnd.set({month: (month - i) + 1, day: 1})
      const monthNumber = monthDate.month
      const yearNumber = monthDate.year
      const monthInterval = Interval.fromDateTimes(monthDate, monthinFutureDate);
      const opts = {useLocaleWeeks: true}
      const monthDays = monthInterval.count('days')

      if (!absences[yearNumber]) {
        absences[yearNumber] = {}
      }
      if (!absences[yearNumber][monthNumber]) {
        absences[yearNumber][monthNumber] = {
          monthName: monthDate.toLocaleString({month: 'long'}),
          days:[]
        }
      }
      let currentWeekNumber = 0
      let dayOfWeek = 0
      let isEndOfWeek = false
      for (let j = 0; j < (monthDays - 1); j++) {
        const dayNumber = j+1
        // const currentDate = dt.set({month: monthNumber - i, day: dayNumber})
        const currentDate = monthDate.set({day: dayNumber})
        const endOfWeek = currentDate.endOf('week')
        isEndOfWeek = currentDate.day === endOfWeek.day;
        const weekNumber = currentDate.weekNumber
        const weekday = currentDate.weekday
        let unit = null
        let unitColor = null
        this.unitDates.forEach((currentUnit) => {
          const unitInterval = currentUnit.interval
          if (unitInterval.contains(currentDate)) {
            unit = currentUnit.name
            unitColor = currentUnit.color
          }
        })
        
        // if the first day of the month is not a Monday, then we need to pad the days from the previous month.
        // if (i === 0 && dayNumber === 1 && weekday !== 1) {  
        if (i === (durationMonths - 1) && dayNumber === 1 && weekday !== 1) {  // starting w/ (durationMonths - 1) because we are looping months in reverse.
          const daysToPad = weekday - dayNumber
          // console.log('daysToPad', daysToPad)
          for (let k = 0; k < daysToPad; k++) {
            // const previousMonthDate = currentDate.minus({days: weekday - 1})
            const dateShim = currentDate.minus({days: weekday - (k+1)})
            // const dateShim = dt.set({month: month - i, day: dayNumber})
            const shimYearNumber = dateShim.year
            if (!absences[shimYearNumber]) {
              absences[shimYearNumber] = {}
            }
            const shimMonthNumber = dateShim.month
            if (!absences[shimYearNumber][shimMonthNumber]) {
              absences[shimYearNumber][shimMonthNumber] = {
                monthName: dateShim.toLocaleString({month: 'long'}),
                days:[]
              }
            }
            const shimWeekNumber = dateShim.weekNumber
            const shimWeekday = dateShim.weekday
            const shimDayNumber = dateShim.day
            let newWeek = false
            let newMonth = false
            let newMonthName = null
            if (currentWeekNumber !== weekNumber) {
              newWeek = true
              currentWeekNumber = weekNumber
            }
            // only add the newMonthName property for the first shim
            if (k === 0) {
              newWeek = true
              currentWeekNumber = weekNumber

              // check if it's a new month during this week
              const newMonthThisWeekDate = currentDate.plus({ days: 6 })
              // const weekNumberNewMonth = newMonthThisWeekDate.weekNumber
              // const monthNumberNewMonth = newMonthThisWeekDate.month
              newMonthName =  newMonthThisWeekDate.setLocale(this.locale).toLocaleString({month: 'long'})
              // if (weekNumberNewMonth === weekNumber && monthNumberNewMonth !== monthNumber) {
                newMonth = true
              // }
            }
            let extraStyles = unitColor?  "shim " + unitColor : "shim"
            absences[shimYearNumber][shimMonthNumber]['days'][shimDayNumber] = {
              date: dateShim,
              weekNumber: shimWeekNumber,
              newWeek: newWeek,
              newMonth: newMonth,
              newMonthName: newMonthName,
              isEndOfWeek: isEndOfWeek,
              weekday: shimWeekday,
              absenceList: [],
              extraStyles: extraStyles,
              unit: unit,
              unitColor: unitColor
            }
          }
        }
        let newWeek = false
        let newMonth = false
        let newMonthName = null
        
        if (currentWeekNumber !== weekNumber) {
          const newMonthThisWeekDate = currentDate.plus({ days: 6 })
          const weekNumberNewMonth = newMonthThisWeekDate.weekNumber
          const monthNumberNewMonth = newMonthThisWeekDate.month
          newWeek = true
          currentWeekNumber = weekNumber
          // check if it's a new month during this week
          newMonthName =  newMonthThisWeekDate.setLocale(this.locale).toLocaleString({month: 'long'})
          if (weekNumberNewMonth === weekNumber && monthNumberNewMonth !== monthNumber) {
            newMonth = true
          }
        }
        // the month could actually start on the first day!
        if (!newMonth && dayNumber === 1 && weekday === 1) {
          newMonth = true
        }
        let extraStyles = newMonth? unitColor + " old-month-in-new-month" : unitColor

        // mark all days that are in the week that has the old month.
        // const daysInMonth = currentDate.daysInMonth
        // const monthOffset = daysInMonth - dayNumber
        // const newMonthThisWeekDate = currentDate.plus({ days: monthOffset })
        // // const weekNumberNewMonth = newMonthThisWeekDate.weekNumber
        // const monthNumberNewMonth = newMonthThisWeekDate.month
        // const oldMonthInNewMonth = monthNumberNewMonth !== monthNumber
        // extraStyles = oldMonthInNewMonth? extraStyles + " old-month-in-new-month" : extraStyles
        // if (dayNumber === daysInMonth) {
        //   extraStyles = extraStyles + " last-day-of-month"
        // }

        const endOfThisWeek = currentDate.endOf('week')
        const endOfThisWeekMonth = endOfThisWeek.month
        if (endOfThisWeekMonth !== monthNumber) {
          extraStyles = extraStyles + " old-month-in-new-month"
        }
        
        absences[yearNumber][monthNumber]['days'][dayNumber] = {
          date: currentDate,
          weekNumber: weekNumber,
          newWeek: newWeek,
          newMonth: newMonth,
          // oldMonthInNewMonth: oldMonthInNewMonth,
          newMonthName: newMonthName,
          isEndOfWeek: isEndOfWeek,
          weekday: weekday,
          absenceList: [],
          unit: unit,
          unitColor: unitColor,
          extraStyles: extraStyles,
        }
      }
    }
    
    const attendanceReports = await this.dashboardService.searchDocs('attendance', this.data.currentClass, null, null, curriculumLabel, randomId, true)
    for (let i = 0; i < attendanceReports.length; i++) {
      const attendanceReport = attendanceReports[i].doc
      const timestamp = attendanceReport.timestamp
      const timestampFormatted = DateTime.fromMillis(timestamp)
      const timestampDate = timestampFormatted.toJSDate()
      // DATE_MED
      const reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
      const attendanceList = attendanceReport.attendanceList
      // To get events into the calendar display
      for (let j = 0; j < attendanceList.length; j++) {
        const attendance = attendanceList[j]
        if (attendance.id === studentId) {
          if (attendance.absent === true) {
            attendance.reportLocaltime = reportLocaltime
            records.push(attendance)

            const dayNumber = timestampFormatted.day
            const monthNumber = timestampFormatted.month
            const yearNumber = timestampFormatted.year

            const absence = {
              month: timestampDate,
              monthString: reportLocaltime
            }
            if (absences[yearNumber] && absences[yearNumber][monthNumber]['days'] && absences[yearNumber][monthNumber]['days'][dayNumber]) {
              absences[yearNumber][monthNumber]['days'][dayNumber]['absenceList'].push(absence)
            }
          }
        }
      }
    }
    this.absences = absences
    this.absentRecords = records
  }

  onCompare(_left: KeyValue<any, any>, _right: KeyValue<any, any>): number {
    return 1;
  }
  onCompareMonth(_left: KeyValue<any, any>, _right: KeyValue<any, any>): number {
    return 1;
    // return -1;
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  showStudentUnitReport(index, student) {
    console.log('showStudentUnitReport', index, student)
    const unit = this.unitDates[index]
  }

  private async generateSummaryReport(currArray, curriculum, currentClass, classId: string, numVisits: number, currentIndex: number = 0) {
    // this.curriculum = currArray.find(x => x.name === curriculumId);
    let curriculumLabel = curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    const ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)
    if (ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    const randomId = currentClass.metadata?.randomId
    const students = await this.dashboardService.getMyStudents(classId);
    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, null, null, curriculumLabel, randomId, true)
    const currentAttendanceReport = attendanceReports? attendanceReports[currentIndex]?.doc : null
    const currentAttendanceList = currentAttendanceReport?.attendanceList
    //
    // // const attendanceListStarter = await this.dashboardService.getAttendanceList(students, savedAttendanceList, this.curriculum)
    // const register = this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', savedAttendanceList);
    // const attendanceList = register.attendanceList
    const studentAttendanceList =  await this.dashboardService.getAttendanceList(students, null, curriculum)
    const register= this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', studentAttendanceList);
    const attendanceList = register.attendanceList

    const scoreReports = []
    for (let i = 0; i < currArray.length; i++) {
      const curriculum = currArray[i];
      let curriculumLabel = curriculum?.label
      const reports = await this.dashboardService.searchDocs('scores', currentClass, null, null, curriculumLabel, randomId, true)
      reports.forEach((report) => {
        report.doc.curriculum = curriculum
        scoreReports.push(report.doc)
      })
    }
    const currentScoreReport = scoreReports[scoreReports.length - 1]

    // if (currentAttendanceReport?.timestamp) {
    //   const timestampFormatted = DateTime.fromMillis(currentAttendanceReport?.timestamp)
    //   // DATE_MED
    //   this.reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
    // } else {
    //   this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    // }

    let scoreReport = currentScoreReport

    if (numVisits) {
      const selectedAttendanceReports = attendanceReports.slice(0,numVisits)
      for (let i = 0; i < selectedAttendanceReports.length; i++) {
        const attendanceReport = selectedAttendanceReports[i];
        const attendanceList = attendanceReport.doc.attendanceList
        await this.dashboardService.processAttendanceReport(attendanceList, register)
      }
    } else {
      await this.dashboardService.processAttendanceReport(currentAttendanceList, register)
    }

    const behaviorReports = await this.dashboardService.searchDocs('behavior', currentClass, null, null, curriculumLabel, randomId, true)
    const currentBehaviorReport = behaviorReports[behaviorReports.length - 1]?.doc
    const behaviorList = currentBehaviorReport?.studentBehaviorList
    // await this.dashboardService.processBehaviorReport(behaviorList, register)

    if (numVisits) {
      const selectedBehaviorReports = behaviorReports.slice(0 - numVisits)
      for (let i = 0; i < selectedBehaviorReports.length; i++) {
        const attendanceReport = selectedBehaviorReports[i];
        const studentBehaviorList = attendanceReport.doc.studentBehaviorList
        await this.dashboardService.processBehaviorReport(studentBehaviorList, register)
      }
    } else {
      if (behaviorList) {
        await this.dashboardService.processBehaviorReport(behaviorList, register)
      }
    }

    for (let i = 0; i < attendanceList.length; i++) {
      const student = attendanceList[i]
      if (ignoreCurriculumsForTracking) {
        for (let j = 0; j < scoreReports.length; j++) {
          const report = scoreReports[j]
          const scoreCurriculum = report.curriculum
          // let curriculumLabel = curriculum?.label
          this.dashboardService.processScoreReport(report, student, this.units, ignoreCurriculumsForTracking, student, scoreCurriculum);
        }
      } else {
        this.dashboardService.processScoreReport(scoreReport, student, this.units, ignoreCurriculumsForTracking, student, curriculum);
      }
    }
    // return {attendanceReports, currentAttendanceReport};
    return register
  }
  
}
