let refreshPromise = null; // single-flight: kitni bhi calls fail hon, refresh sirf 1 baar

function refreshSession() {
  refreshPromise ??= fetch('/api/auth/refreshToken', {
    method: 'POST',
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => { refreshPromise = null; });
  return refreshPromise;
}

function goLogin() {
  window.location.href = '/login';
  return new Promise(() => {}); // page badal raha hai, caller aage nahi badhega
}

export async function clientApi(path, options = {}) {
  const send = () =>
    fetch(`/api${path}`, { ...options, credentials: 'include', cache: 'no-store' });

  let res = await send();

  if (res.status === 401 && !path.startsWith('/auth/')) {
    const ok = await refreshSession();
    if (!ok) return goLogin();
    res = await send();                        // same request dobara
    if (res.status === 401) return goLogin();  // phir bhi 401 to session khatam
  }
  return res;
}

// JSON + status ek saath. Network error par bhi crash nahi
export async function clientJson(path, options = {}) {
  try {
    const res = await clientApi(path, options);
    const body = await res.json().catch(() => null);
    return {
      ok: res.ok,
      status: res.status,
      data: body?.data ?? null,
      error: body?.errors || body?.message || null,
    };
  } catch {
    return { ok: false, status: 0, data: null, error: 'Network error' };
  }
}

// Shortcuts
export const getJson = (path) => clientJson(path);

export const postJson = (path, payload) =>
  clientJson(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const putJson = (path, payload) =>
  clientJson(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const deleteJson = (path) => clientJson(path, { method: 'DELETE' });



    // HOW TO USE THIS?
// FOR GET 
  //     const [users, setUsers] = useState([]) 
  // useEffect(() => {
  //   async function load() {
  //      const res = await getJson('/users'); // 401 do refresh and retry
  //        if (!res.ok) setError(res.error || 'Failed to load users');
  //     setUsers(res?.data || [])
  //   }
  //   load()
  // }, [])


// A. Form submit | POST
//   const [name, setName] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState('');

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (saving || !name.trim()) return; // double submit rokna

//     setSaving(true);
//     setError('');
//     const r = await postJson('/dummy', { item: name.trim() });
//     setSaving(false);

//     if (!r.ok) return setError(r.error || 'Save failed');
//     setName('');
//     onAdded?.(r.data);
//   }

//   return (
//     <form onSubmit={handleSubmit}>
//       <input value={name} onChange={(e) => setName(e.target.value)} />
//       <button type='submit' disabled={saving}>{saving ? 'Saving...' : 'Add'}</button>
//       {error && <p>{error}</p>}
//     </form>
//   );
// }

// ---------------


// B. File upload (FormData)
// const fd = new FormData();
// fd.append('file', file);
// fd.append('title', 'My photo');

// const r = await clientJson('/upload', { method: 'POST', body: fd });
// // Content-Type header MAT lagao. Browser boundary ke saath khud lagata hai.

// ----------------


// C. PUT aur DELETE
// await putJson(`/users/${id}`, { name: 'Ram' });
// await deleteJson(`/users/${id}`);
