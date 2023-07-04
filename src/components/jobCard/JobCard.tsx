

type JobCardPT = {
    lookingUserCount: number
    title: string
    //salary: string
    city: string
    experienceTime: string
    companyName: string
    minSalary: number
    maxSalary: number
}

export const JobCard = ({experienceTime, minSalary, maxSalary, city, lookingUserCount, title, companyName}: JobCardPT) => {
    return (
        <div style={{'border': '1px solid', 'display': 'inline-block'}}>
            <div>{title}</div>
            <div>{lookingUserCount}</div>
            <div>{city}</div>
            <div>{minSalary}{maxSalary ? `-${maxSalary}` : ''} {minSalary ? 'EUR' : ''}</div>
            <div>{experienceTime === '0' ? 'No experience': experienceTime}</div>
            <div>{companyName}</div>
        </div>
    )
}
