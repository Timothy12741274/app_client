'use client'

import {useEffect, useRef, useState} from "react";
import {JobCard} from "@/components/jobCard/JobCard";
import axios from "axios";
import {jobDto} from '../dto/jobDto'
import {Provider} from "react-redux";
import {store} from "@/store/store";

type vt = string | number | boolean

export default function Home() {
    const [allJobs, setAllJobs] = useState([])

    const [jobs, setJobs] = useState([])

    const [locations, setLocations] = useState([])

    const [pageCount, setPageCount] = useState(1)

    const [isLoading, setIsLoading] = useState(false)

    const fn = async () => {
        setIsLoading(true)
        try {
            const params = {pageSize: 5, pageCount}
            const res = await axios.get('http://localhost:5000/jobs', {withCredentials: true, params, })

            const jobs = res.data.map(j => jobDto(j))

            setAllJobs(jobs)
            setJobs(jobs)
            setLocations(jobs.map(({city, country}) => ({city, country})))
        } finally {
            setIsLoading(false)
        }
    }

  useEffect(() => { fn() }, [])
  useEffect(() => { fn() }, [pageCount])

    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current, isEndReached = el.scrollTop + el.clientHeight >= el.scrollHeight
        el.addEventListener('scroll', () => isEndReached && setPageCount(v => v+1))
    }, [ref.current])

    const hnd4 = (v: vt, field: string) => setJobs(!v ? allJobs : allJobs.filter(({ [field]: fieldValue }) => fieldOp(fieldValue, v, field)));

    const fieldOp = (fv, v, field) => field !== 'salary' ? fv === v : fv > v

    if (!jobs) return null

  return (
    <main ref={ref}>
        <select defaultValue={''} onChange={e => hnd4(e.currentTarget.value, 'experienceTime')}>
            <option value={''}>Not important</option>
            <option value={'6+'}>6+ years</option>
            <option value={'3-6'}>3-6 years</option>
            <option value={'1-3'}>1-3 years</option>
            <option value={'0'}>No experience</option>
        </select>

        <select defaultValue={0} onChange={e => hnd4(Number(e.currentTarget.value), 'maxSalary')}>
            <option value={''}>Not important</option>
            <option value={900}>from 900</option>
            <option value={1800}>from 1800</option>
            <option value={2700}>from 2700</option>
            <option value={3650}>from 3650</option>
            <option value={4550}>from 4550</option>
            <option value={5450}>from 5450</option>
        </select>

        <select defaultValue={''} onChange={e => hnd4(e.currentTarget.value, 'city')}>
            <option value={''}>Not important</option>
            {locations.map(({city, country}) => <option value={city}>{`${city}, ${country}`}</option>)}
        </select>

        <input type={'checkbox'} onChange={e => hnd4(e.currentTarget.checked, 'isRemote')}/>

        <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>{jobs.map(j => <JobCard {...j} />)}</div>

        {isLoading && <div>isLoading...</div>}

    </main>
  )
}
