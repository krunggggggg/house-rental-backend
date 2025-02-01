const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const Tenant = {
  create: async (tenantData) => {
    const id = uuidv4();
    const query = `
      INSERT INTO tenants (tenant_id, full_name, email, phone, is_active)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const values = [
      id,
      tenantData.full_name,
      tenantData.email,
      tenantData.phone,
      tenantData.is_active || false,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  getAll: async (filters = {}) => {
    let query = `SELECT * FROM tenants`;
    let conditions = [];
    let values = [];

    //  Search filter (ILIKE for case-insensitive search)
    if (filters.search) {
      values.push(`%${filters.search}%`);
      conditions.push(`full_name ILIKE $${values.length}`);
    }

    //  Active status filter (convert string to boolean)
    if (filters.is_active !== undefined) {
      values.push(filters.is_active === "true");
      conditions.push(`is_active = $${values.length}`);
    }

    //  Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    }

    //  Sorting with allowed columns to prevent SQL injection
    const allowedSortFields = ["full_name", "created_at", "is_active"];
    if (filters.sortBy && allowedSortFields.includes(filters.sortBy)) {
      const sortDirection = filters.sortOrder === "desc" ? "DESC" : "ASC";
      query += ` ORDER BY ${filters.sortBy} ${sortDirection}`;
    }

    //  Execute query
    const { rows } = await db.query(query, values);
    return rows;
  },

  delete: async (id) => {
    const query = `DELETE FROM tenants WHERE tenant_id = $1 RETURNING *;`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
  },

  update: async (id, updates) => {
    let setClauses = [];
    let values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
      setClauses.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }

    if (setClauses.length === 0) return null;

    values.push(id);
    const query = `UPDATE tenants SET ${setClauses.join(
      ", "
    )} WHERE tenant_id = $${values.length} RETURNING *;`;

    const { rows } = await db.query(query, values);
    return rows[0];
  },
};

module.exports = Tenant;
