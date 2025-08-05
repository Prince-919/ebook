import asyncHandler from "express-async-handler";
import { UpdateHistoryRequestHandler } from "@/types";
import { HistoryModel } from "@/models";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { sendErrorResponse } from "@/utils/helper";

export const updateBookHistory: UpdateHistoryRequestHandler = asyncHandler(
  async (req, res) => {
    const { bookId, lastLocation, highlights, remove } = req.body;

    let history = await HistoryModel.findOne({
      book: bookId,
      reader: req.user.id,
    });
    if (!history) {
      history = new HistoryModel({
        reader: req.user.id,
        book: bookId,
        lastLocation,
        highlights,
      });
    } else {
      if (lastLocation) history.lastLocation = lastLocation;
      // storing the highlight
      if (highlights?.length && !remove) history.highlights.push(...highlights);
      // removing the highlight
      if (highlights?.length && remove) {
        history.highlights = history.highlights.filter(
          (item) => !highlights.find((h) => h.selection === item.selection)
        );
      }
    }
    await history.save();
    res.send();
  }
);
export const getBookHistory: RequestHandler = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!isValidObjectId(bookId)) {
    return sendErrorResponse({
      status: 422,
      message: "Invalid book id!",
      res,
    });
  }
  const history = await HistoryModel.findOne({
    book: bookId,
    reader: req.user.id,
  });
  if (!history) {
    return sendErrorResponse({
      status: 404,
      message: "History not found!",
      res,
    });
  }

  res.json({
    history: {
      lastLocation: history.lastLocation,
      highlights: history.highlights.map((h) => ({
        fill: h.fill,
        selection: h.selection,
      })),
    },
  });
});
