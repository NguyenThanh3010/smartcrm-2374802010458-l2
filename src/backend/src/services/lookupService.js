const repository = require('../repositories/lookupRepository');

async function listActiveIssueCategories() {
  return repository.listActiveIssueCategories();
}

async function listActiveServiceCenters() {
  return repository.listActiveServiceCenters();
}

module.exports = {
  listActiveIssueCategories,
  listActiveServiceCenters,
};
