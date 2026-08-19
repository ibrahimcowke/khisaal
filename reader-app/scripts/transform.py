import json, re, sys

SRC = "/mnt/user-data/uploads/إمتاع-القارئ-الجزء-الأول-Kindle-Clean.json"
OUT = "/home/claude/reader-app/public/data/book.json"

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)

pages = data["pages"]
hidx = {h["page_id"]: h["title"] for h in data["heading_index"]}

# Group pages into chapters by consecutive heading_index titles.
groups = []
cur_title = None
cur_pages = []
for p in pages:
    title = hidx.get(p["id"])
    if title is None:
        if not cur_pages:
            cur_pages = [p["id"]]
            cur_title = p["title"]
        else:
            cur_pages.append(p["id"])
        continue
    if title != cur_title:
        if cur_pages:
            groups.append((cur_title, cur_pages))
        cur_title = title
        cur_pages = [p["id"]]
    else:
        cur_pages.append(p["id"])
if cur_pages:
    groups.append((cur_title, cur_pages))

pages_by_id = {p["id"]: p for p in pages}

chapters = []
block_counter = 0
for order, (title, page_ids) in enumerate(groups, start=1):
    chapter_id = f"chapter-{order:03d}"
    blocks = []
    tags = set()
    word_count = 0
    src_start = None
    src_end = None
    for pid in page_ids:
        p = pages_by_id[pid]
        if src_start is None:
            src_start = p["source_pdf_page"]
        src_end = p["source_pdf_page"]
        word_count += p.get("word_count", 0)
        for t in p.get("tags", []):
            tags.add(t)
        for b in p["blocks"]:
            block_counter += 1
            gid = f"{chapter_id}-b{block_counter:04d}"
            btype = b["type"]
            block = {
                "id": gid,
                "type": "list" if btype == "list_item" else btype,
                "sourcePage": p["source_pdf_page"],
                "pageId": pid,
            }
            if btype == "list_item":
                block["items"] = [b["text"]]
            else:
                block["text"] = b["text"]
            blocks.append(block)
    # merge consecutive list blocks (list_item entries) into single list block
    merged = []
    for b in blocks:
        if b["type"] == "list" and merged and merged[-1]["type"] == "list" and merged[-1]["sourcePage"] == b["sourcePage"]:
            merged[-1]["items"].extend(b["items"])
        else:
            merged.append(b)

    # skip the pure cover-title chapter's heading dup, but keep as is
    chapters.append({
        "id": chapter_id,
        "title": title,
        "order": order,
        "sourcePageStart": src_start,
        "sourcePageEnd": src_end,
        "pageIds": page_ids,
        "wordCount": word_count,
        "tags": sorted(tags),
        "blocks": merged,
    })

total_pages = len(pages)
total_words = sum(p.get("word_count", 0) for p in pages)
total_blocks = sum(len(c["blocks"]) for c in chapters)

book = {
    "id": data["book"]["id"],
    "title": data["book"]["title"],
    "shortTitle": data["book"]["short_title"],
    "subtitle": data["book"]["volume"],
    "author": data["book"]["author"],
    "language": data["book"]["language"],
    "direction": data["book"]["direction"],
    "sourcePageCount": data["book"]["source_page_count"],
    "totalSections": len(chapters),
    "totalPages": total_pages,
    "totalWords": total_words,
    "totalBlocks": total_blocks,
    "description": "مجموعة نفيسة من الحكم والأمثال وروائع الأقوال، جُمعت لتُمتع القارئ بجمال الكلم وتفتح له آفاقاً في التأمل والحكمة.",
}

out = {
    "schemaVersion": "1.0.0",
    "book": book,
    "reading": data["reading"],
    "chapters": chapters,
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))

print("chapters:", len(chapters))
print("total blocks:", total_blocks)
print("total words:", total_words)
import os
print("output size (KB):", round(os.path.getsize(OUT)/1024, 1))
