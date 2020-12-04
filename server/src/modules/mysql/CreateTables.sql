#for some reasons that I am yet to find out, if the following tables are missing some columns the tangerine to MySQL will not work
#but then after the intial/first successfull run, then you can delete some column, the conversion will recreate these tables and it works fine from there now

CREATE TABLE `case` (
  `CaseID` text,
  `formId` text,
  `formTitle` text,
  `startUnixtime` bigint DEFAULT NULL,
  `buildId` text,
  `buildChannel` text,
  `deviceId` text,
  `groupId` text,
  `complete` bigint DEFAULT NULL,
  `screen_id` bigint DEFAULT NULL,
  `status` text,
  `ga_conception_date` text,
  `ga_type` text,
  `firstname` bigint DEFAULT NULL,
  `surname` text,
  `participant_id` text,
  `village` text,
  `phone` text,
  `nextvstdt` text,
  `nextvstevt` text,
  `caseDefinitionId` text,
  `dbRevision` text,
  `collection` text,
  `startDatetime` text,
  `uploadDatetime` text,
  `numinf` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `caseevent` (
  `CaseEventID` varchar(100) NOT NULL,
  `dbRevision` text,
  `caseId` varchar(100) DEFAULT NULL,
  `status` text,
  `name` text,
  `estimate` tinyint(1) DEFAULT NULL,
  `caseEventDefinitionId` text,
  `startDate` bigint DEFAULT NULL,
  `estimatedDay` text,
  `scheduledDay` text,
  PRIMARY KEY (`CaseEventID`),
  KEY `fk_casevent_case_id` (`caseId`),
  CONSTRAINT `caseevent_chk_1` CHECK ((`estimate` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `eventform` (
  `EventFormID` varchar(100) NOT NULL,
  `dbRevision` text,
  `complete` tinyint(1) DEFAULT NULL,
  `caseId` varchar(100) DEFAULT NULL,
  `participantId` text,
  `caseEventId` text,
  `eventFormDefinitionId` text,
  `formResponseId` text,
  PRIMARY KEY (`EventFormID`),
  KEY `fk_eventform_case_id` (`caseId`),
  CONSTRAINT `eventform_chk_1` CHECK ((`complete` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `participant` (
  `ParticipantID` varchar(100) NOT NULL,
  `CaseID` varchar(100) DEFAULT NULL,
  `firstname` text,
  `surname` text,
  `participant_id` bigint DEFAULT NULL,
  `caseRoleId` text,
  `dbRevision` text,
  `numInf` text,
  PRIMARY KEY (`ParticipantID`),
  KEY `fk_participant_case_id` (`CaseID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


#with foreign key consraints, the conversion code will not work with foriegn key constranits as other records cannot be deleted at will
alter table caseevent drop foreign key fk_casevent_case_id;
alter table eventform drop foreign key fk_eventform_case_id;
alter table participant drop foreign key fk_participant_case_id;
