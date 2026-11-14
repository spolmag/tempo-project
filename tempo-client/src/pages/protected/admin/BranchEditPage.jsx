import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import BranchForm from "../../../components/BranchForm.jsx";
import { getBranchError } from "../../../lib/branchErrors.js";
import { branchName } from "../../../lib/userLabels.js";
import { getBranch, updateBranch } from "../../../services/adminBranches.js";
