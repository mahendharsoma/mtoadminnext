"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/jwt";
import { jobCardRepository } from "@/lib/db/repositories/job-card.repository";
import { getCurrentDateTimeForDb } from "@/lib/utils";
import { failureResponse, successResponse } from "@/lib/constants";

function revalidateJobCard(jobCardId: number) {
  revalidatePath(`/job-cards/${jobCardId}`);
  revalidatePath("/job-cards");
}

export async function assignSparePartItemAction(formData: FormData) {
  const session = await requireSession();
  const jobCardId = Number(formData.get("job_card_id"));
  if (!jobCardId) return failureResponse("Unable to Get Job Card Details, Please try again");

  const jobCardAction = String(formData.get("job_card_action") || "");
  const now = getCurrentDateTimeForDb();

  try {
    if (jobCardAction === "reject") {
      await jobCardRepository.updateJobCard(jobCardId, {
        job_card_status: "Rejected",
        updated_by: session.userId,
        updated_on: now,
      });
      revalidateJobCard(jobCardId);
      return successResponse(undefined, "Job Card Rejected Successfully!", { refreshPage: true });
    }

    const jobTypeId = Number(formData.get("job_type_id"));
    const serviceTypeId = Number(formData.get("service_type_id"));
    const mechanicIds = formData.getAll("mechanic_id").map((v) => Number(v)).filter(Boolean);
    const kmr = String(formData.get("kmr") || "").trim();
    const dateIn = String(formData.get("date_in") || "").trim();
    const timeIn = String(formData.get("time_in") || "").trim();

    if (!jobTypeId || !serviceTypeId || !kmr || !dateIn || !timeIn || mechanicIds.length === 0) {
      return failureResponse("Please fill all required fields");
    }

    const updateData: Record<string, unknown> = {
      job_type_id: jobTypeId,
      service_type_id: serviceTypeId,
      kmr,
      date_in: dateIn,
      time_in: timeIn,
      remarks: formData.get("remarks"),
      outside_work_shop: formData.get("outside_work_shop"),
      updated_by: session.userId,
      updated_on: now,
    };

    if (jobCardAction === "approve") {
      updateData.job_card_status = "Approve";
      if (serviceTypeId === 4 || serviceTypeId === 5) {
        updateData.condemnation_status = "Received";
      }
    }

    await jobCardRepository.updateJobCard(jobCardId, updateData);

    await jobCardRepository.deleteJobCardMechanics(jobCardId);
    for (const mechanicId of mechanicIds) {
      await jobCardRepository.insertJobCardMechanicMap({
        job_card_id: jobCardId,
        mechanic_id: mechanicId,
        created_by: session.userId,
        created_on: now,
      });
    }

    revalidateJobCard(jobCardId);
    return successResponse(undefined, "Successfully Updated Job Card!", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Update Job Card, Please try again");
  }
}

export async function assignJobCardItemsAction(
  jobCardId: number,
  items: Array<{ item_id: number; quantity: number; is_common: number }>
) {
  const session = await requireSession();
  if (!jobCardId) return failureResponse("Invalid job card");

  try {
    const jobCard = await jobCardRepository.getById(jobCardId);
    if (!jobCard) return failureResponse("Unable to get Job card data");
    if (jobCard.job_card_status === "Close") {
      return failureResponse("Unable to Allocate Items, Job Card is Closed");
    }
    if (jobCard.job_card_status === "Rejected") {
      return failureResponse("Unable to Allocate Items, Job Card is Rejected");
    }

    const now = getCurrentDateTimeForDb();
    await jobCardRepository.replaceJobCardItems(jobCardId, items, session.userId, now);
    revalidateJobCard(jobCardId);
    return successResponse(undefined, "Successfully Approved Items", { refreshPage: true });
  } catch {
    return failureResponse("Unable to Add Item, Please Try again later");
  }
}

export async function addJobCardOilAction(
  jobCardId: number,
  lubricantId: number,
  requiredQuantity: number
) {
  const session = await requireSession();
  if (!jobCardId || !lubricantId) return failureResponse("Invalid job card or lubricant");
  if (!requiredQuantity || requiredQuantity <= 0) return failureResponse("Please enter valid quantity");

  try {
    const result = await jobCardRepository.addJobCardOil(
      jobCardId,
      lubricantId,
      requiredQuantity,
      session.userId,
      getCurrentDateTimeForDb()
    );
    if (result === "duplicate") {
      return failureResponse(
        "This oil has already been added to the job card. The same oil cannot be added twice."
      );
    }
    revalidateJobCard(jobCardId);
    return successResponse(undefined, "Oil added successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to add oil, please try later");
  }
}

export async function approveJobCardOilAction(jobCardOilId: number, jobCardId: number) {
  const session = await requireSession();
  if (!jobCardOilId) return failureResponse("Unable to approve oil, invalid oil id");

  try {
    const result = await jobCardRepository.approveJobCardOil(
      jobCardOilId,
      session.userId,
      getCurrentDateTimeForDb()
    );
    if (result === "insufficient_inventory") {
      return failureResponse("Insufficient lubricant inventory to approve this oil");
    }
    revalidateJobCard(jobCardId);
    return successResponse(undefined, "Oil approved successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to approve oil, please try later");
  }
}

export async function updateJobCardOilAction(jobCardOilId: number, jobCardId: number, quantity: number) {
  const session = await requireSession();
  if (!jobCardOilId) return failureResponse("Unable to update oil, invalid oil id");

  try {
    const result = await jobCardRepository.updateJobCardOilQuantity(
      jobCardOilId,
      quantity,
      session.userId,
      getCurrentDateTimeForDb()
    );
    if (result === "invalid_quantity") {
      return failureResponse("Quantity must be greater than zero");
    }
    if (result === "insufficient_inventory") {
      return failureResponse("Insufficient lubricant inventory to increase quantity");
    }
    revalidateJobCard(jobCardId);
    return successResponse(undefined, "Oil quantity updated successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to update oil, please try later");
  }
}

export async function deleteJobCardOilAction(jobCardOilId: number, jobCardId: number) {
  const session = await requireSession();
  if (!jobCardOilId) return failureResponse("Unable to delete oil, invalid oil id");

  try {
    await jobCardRepository.deleteJobCardOil(
      jobCardOilId,
      session.userId,
      getCurrentDateTimeForDb()
    );
    revalidateJobCard(jobCardId);
    return successResponse(undefined, "Oil deleted successfully", { refreshPage: true });
  } catch {
    return failureResponse("Unable to delete oil, please try later");
  }
}
