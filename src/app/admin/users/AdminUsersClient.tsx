"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminUserRow } from "@/lib/api";
import { createAdminUser, listAdminUsers, updateAdminUserRole } from "@/lib/api-client";

type Role = "student" | "admin";

export function AdminUsersClient() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => Number(b.role === "admin") - Number(a.role === "admin")),
    [users],
  );

  async function refresh(q = query) {
    setBusy(true);
    setMessage(null);
    try {
      setUsers(await listAdminUsers(q));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load users.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh("").catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await createAdminUser({
        email: email.trim(),
        name: name.trim() || null,
        phone: phone.trim() || null,
        role,
      });
      setEmail("");
      setName("");
      setPhone("");
      setRole("admin");
      setMessage("User created.");
      await refresh(query);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create user.");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(user: AdminUserRow, nextRole: Role) {
    setBusy(true);
    setMessage(null);
    try {
      const updated = await updateAdminUserRole(user.id, nextRole);
      setUsers((rows) => rows.map((row) => (row.id === user.id ? { ...row, role: updated.role } : row)));
      setMessage(`${user.email} is now ${nextRole}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update role.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        className="grid gap-3 rounded-md border border-line p-4 md:grid-cols-[1fr_1fr_1fr_auto_auto]"
        onSubmit={handleCreate}
      >
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          placeholder="email@example.com"
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Mobile"
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="admin">Admin</option>
          <option value="student">Student</option>
        </select>
        <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-sm">
          Create
        </button>
      </form>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          refresh(query).catch(() => {});
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by email, name, or mobile"
          className="w-full rounded-md border border-line px-3 py-2 text-sm sm:max-w-md"
        />
        <button type="submit" disabled={busy} className="btn-secondary px-4 py-2 text-sm">
          Search
        </button>
      </form>

      {message && <p className="text-sm text-brand-700">{message}</p>}

      <section className="overflow-hidden rounded-md border border-line">
        <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-line px-4 py-2 text-xs font-medium uppercase text-ink/50 md:grid-cols-[1fr_140px_120px_150px]">
          <span>User</span>
          <span className="hidden md:block">Mobile</span>
          <span className="hidden md:block">Role</span>
          <span>Action</span>
        </div>
        {sortedUsers.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink/60">No users found.</p>
        ) : (
          <ul className="divide-y divide-line">
            {sortedUsers.map((user) => {
              const nextRole: Role = user.role === "admin" ? "student" : "admin";
              return (
                <li
                  key={user.id}
                  className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_140px_120px_150px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name || user.email}</p>
                    <p className="truncate text-xs text-ink/55">{user.email}</p>
                  </div>
                  <span className="hidden self-center text-ink/65 md:block">{user.phone || "-"}</span>
                  <span className="hidden self-center md:block">
                    <span className="rounded bg-ink/5 px-2 py-1 text-xs uppercase text-ink/65">
                      {user.role}
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => changeRole(user, nextRole)}
                    className="self-center rounded-md border border-line px-3 py-1.5 text-xs transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50"
                  >
                    Make {nextRole}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
