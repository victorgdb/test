const {
  ActivitiesService,
  ActivityType,
  MemberActivity,
  Member,
  Company,
  DataAccessLayer
} = require('../index');
let dataAccessLayer = new DataAccessLayer();
const activitiesService = new ActivitiesService({ dataAccessLayer });

beforeEach(() => {
  dataAccessLayer.init();
})

describe('add member activity tests', () => {
  test('can add member activity', () => {
    const newCompany = new Company({
      id: 'companyID1',
      credits: 123,
      isSubscribed: false
    });

    const newMember = new Member({ id: 'employeeID1', company: newCompany });

    const memberActivity = new MemberActivity({
      member: newMember,
      activityType: ActivityType.coaching,
      startDate: Date.now() + 10000000
    });

    expect(dataAccessLayer.getActivities().length).toBe(0);
    activitiesService.addMemberActivity({ memberActivity, dataAccessLayer });
    expect(dataAccessLayer.getActivities().length).toBe(1);
  });

  test('Member activity must not be in the past', () => {
    const newCompany = new Company({
      id: 'companyID1',
      credits: 123,
      isSubscribed: false
    });

    const newMember = new Member({ id: 'employeeID1', company: newCompany });

    const correctMemberActivity = new MemberActivity({
      member: newMember,
      company: newCompany,
      activityType: ActivityType.coaching,
      startDate: Date.now() + 10000000
    });
    const pastMemberActivity = new MemberActivity({
      member: newMember,
      activityType: ActivityType.coaching,
      startDate: Date.now() - 10000000
    });
    expect(() => activitiesService.addMemberActivity({ memberActivity: correctMemberActivity })).not.toThrowError();

    expect(() => activitiesService.addMemberActivity({ memberActivity: pastMemberActivity })).toThrowError();
  });

  test('Company must have enough credits', () => {
    const company1 = new Company({
      id: 'companyID1',
      credits: 123,
      isSubscribed: false
    });

    const company2 = new Company({
      id: 'companyID2',
      credits: 0,
      isSubscribed: false
    });

    const memberOfCompany1 = new Member({ id: 'employeeID1', company: company1 });
    const memberOfCompany2 = new Member({ id: 'employeeID2', company: company2 });

    const member1Activity = new MemberActivity({
      member: memberOfCompany1,
      company: company1,
      activityType: ActivityType.coaching,
      startDate: Date.now() + 10000000
    });
    const member2Activity = new MemberActivity({
      member: memberOfCompany2,
      activityType: ActivityType.coaching,
      company: company2,
      startDate: Date.now() + 10000000
    });

    expect(() => activitiesService.addMemberActivity({ memberActivity: member1Activity })).not.toThrowError()
    expect(() => activitiesService.addMemberActivity({ memberActivity: member2Activity })).toThrowError()
  });
});

test('can get get Max Credits Spent By An Employee', () => {
  const company1 = new Company({
    id: 'companyID1',
    credits: 123,
    isSubscribed: false
  });

  const company2 = new Company({
    id: 'companyID2',
    credits: 123,
    isSubscribed: false
  });

  const member1OfCompany1 = new Member({ id: 'employeeID1', company: company1 });
  const member2OfCompany1 = new Member({ id: 'employeeID2', company: company1 });

  const member3OfCompany2 = new Member({ id: 'employeeID3', company: company2 });

  const member1Activity = new MemberActivity({
    member: member1OfCompany1,
    company: company1,
    activityType: ActivityType.coaching,
    startDate: Date.now() + 10000000
  });
  const member2Activity = new MemberActivity({
    member: member2OfCompany1,
    company: company1,
    activityType: ActivityType.psychologist,
    startDate: Date.now() + 10000000
  });
  const member3Activity = new MemberActivity({
    member: member3OfCompany2,
    activityType: ActivityType.coaching,
    company: company2,
    startDate: Date.now() + 10000000
  });
  const member3Activity2 = new MemberActivity({
    member: member3OfCompany2,
    activityType: ActivityType.dancing,
    company: company2,
    startDate: Date.now() + 10000000
  });
  activitiesService.addMemberActivity({ memberActivity: member1Activity })
  activitiesService.addMemberActivity({ memberActivity: member2Activity })
  activitiesService.addMemberActivity({ memberActivity: member3Activity })
  activitiesService.addMemberActivity({ memberActivity: member3Activity2 })

  expect(activitiesService.getMaxCreditsSpentByAnEmployee({
    company: company1
  })).toEqual(ActivityType.psychologist.cost)

    expect(activitiesService.getMaxCreditsSpentByAnEmployee({
    company: company2
  })).toEqual(ActivityType.coaching.cost+ActivityType.dancing.cost)
});