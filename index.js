
const ActivityType = {
  coaching: {
    cost: 1,
  },
  dancing: {
    cost: 1,
  },
  psychologist: {
    cost: 3,
  },
  nutritionist: {
    cost: 2,
  },
}

class Company  {
  constructor({id, credits, isSubscribed}) {
    this.id = id;
    this.credits = credits;
    this.isSubscribed = isSubscribed;
    this.activities = [];
  }
}

class Member {
  constructor({ id, company }) {
    this.id = id;
    this.company = company;
  }
}

class MemberActivity {
  constructor({ member, company, activityType, startDate }) {
    this.member = member;
    this.company = company;
    this.activityType = activityType;
    this.startDate = startDate;
    this.isCancelled = false;
  }
}

class DataAccessLayer {
  constructor() {
    this.init()
  }

  addActivity({activity}) {
    this.activities.push(activity);
  }
  addMember({member}) {
    this.members.push(member);
  }
  addCompany({company}) {
    this.companies.push(company);
  }

  init() {
    this.activities = [];
    this.members = [];
    this.companies = [];
  }
  getActivities({
    filters
  } = {
    filters: {
      companyId: undefined
    }
  }) {
    let toReturn = this.activities;
    if (filters.companyId) {
      toReturn = toReturn.filter((anActivity) => anActivity.company.id  === filters.companyId)
    }
    return toReturn;
  }

  /*
    Devrait contenir update, delete etc...
  */
}
class ActivitiesService {
  constructor({ dataAccessLayer }) {
    this.dataAccessLayer = dataAccessLayer;
  }
  addMemberActivity({ memberActivity }) {
    if (!memberActivity) throw new Error('missing member activity');

    if (memberActivity.member.company.credits < memberActivity.activityType.cost) {
      throw new Error('Company does not have enough credits');
    }
    if (memberActivity.startDate < Date.now()) {
      throw new Error('Activity must not be in the past');
    }

    this.dataAccessLayer.addActivity({activity: memberActivity})
  }

  cancelMemberActivity({ memberActivity }) {
    memberActivity.isCancelled = true;
  }
  addSubscribtionCredits({ company, credits }) {
    if (credits < 0) {
      throw new Error('Credits should be a positive number');
    }
    company.credits = credits;
  }
  getRemainingCredits({ company }) {
    if (!company) {
      throw new Error('Invalid Company')
    }
    return company.credits;
  }
  getMaxCreditsSpentByAnEmployee({ company }) {
    const activities = this.dataAccessLayer.getActivities({
      filters: { companyId: company.id }
    })

    const creditsPerEmployee = {};

    activities.forEach((anActivity) => {
      if (typeof creditsPerEmployee[anActivity.member.id] === 'undefined') {
        creditsPerEmployee[anActivity.member.id] = 0;
      }
      creditsPerEmployee[anActivity.member.id] += anActivity.activityType.cost;
    })

    return Math.max(...Object.values(creditsPerEmployee));
  }
  getAverageCreditsSpentByEmployees({ company }) {

  }
}

module.exports = {
  ActivitiesService,
  MemberActivity,
  Member,
  Company,
  ActivityType,
  DataAccessLayer
}