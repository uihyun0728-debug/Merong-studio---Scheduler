import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { sortSchedules } from '../utils/dateUtils.js'

export function useSchedules() {
  const [shooting, setShooting] = useState([])
  const [rental, setRental] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: s, error: se }, { data: r, error: re }] = await Promise.all([
        supabase.from('shooting_schedules').select('*'),
        supabase.from('rental_schedules').select('*'),
      ])
      if (se) throw se
      if (re) throw re
      setShooting(sortSchedules(s || []))
      setRental(sortSchedules(r || []))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Shooting CRUD
  const addShooting = async (data) => {
    const { error } = await supabase.from('shooting_schedules').insert([data])
    if (error) throw error
    await fetchAll()
  }

  const updateShooting = async (id, data) => {
    const { error } = await supabase.from('shooting_schedules').update(data).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  const deleteShooting = async (id) => {
    const { error } = await supabase.from('shooting_schedules').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  // Rental CRUD
  const addRental = async (data) => {
    const { error } = await supabase.from('rental_schedules').insert([data])
    if (error) throw error
    await fetchAll()
  }

  const updateRental = async (id, data) => {
    const { error } = await supabase.from('rental_schedules').update(data).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  const deleteRental = async (id) => {
    const { error } = await supabase.from('rental_schedules').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  return {
    shooting,
    rental,
    loading,
    error,
    refresh: fetchAll,
    addShooting,
    updateShooting,
    deleteShooting,
    addRental,
    updateRental,
    deleteRental,
  }
}
