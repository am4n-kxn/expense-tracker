import { useEffect, useState } from 'react';
import { getCategories } from '../api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function reload() {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError('Could not load categories');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  return { categories, loading, error, reload };
}
