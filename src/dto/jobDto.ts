export const jobDto = (j) => {
  const newJ = {...j,
      lookingUserCount: j.looking_user_count,
      companyId: j.company_id,
      experienceTime: j.experience_time,
      isRemote: j.is_remote,
      minSalary: j.min_salary,
      maxSalary: j.max_salary
  }
    delete newJ.looking_user_count;
    delete newJ.company_id;
    delete newJ.experience_time;
    delete newJ.is_remote;
    delete newJ.min_salary;
    delete newJ.max_salary;

    return newJ

}