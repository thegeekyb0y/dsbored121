-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "ActiveSession_userId_idx" ON "ActiveSession"("userId");

-- CreateIndex
CREATE INDEX "ActiveSession_isPaused_idx" ON "ActiveSession"("isPaused");

-- CreateIndex
CREATE INDEX "Room_code_idx" ON "Room"("code");

-- CreateIndex
CREATE INDEX "Room_hostId_idx" ON "Room"("hostId");

-- CreateIndex
CREATE INDEX "Room_createdAt_idx" ON "Room"("createdAt");

-- CreateIndex
CREATE INDEX "RoomMember_roomId_idx" ON "RoomMember"("roomId");

-- CreateIndex
CREATE INDEX "RoomMember_userId_idx" ON "RoomMember"("userId");

-- CreateIndex
CREATE INDEX "RoomMember_joinedAt_idx" ON "RoomMember"("joinedAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "StudySession_userId_idx" ON "StudySession"("userId");

-- CreateIndex
CREATE INDEX "StudySession_userId_createdAt_idx" ON "StudySession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StudySession_userId_tag_idx" ON "StudySession"("userId", "tag");

-- CreateIndex
CREATE INDEX "StudySession_createdAt_idx" ON "StudySession"("createdAt");

-- CreateIndex
CREATE INDEX "StudySession_tag_idx" ON "StudySession"("tag");

-- CreateIndex
CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");

-- CreateIndex
CREATE INDEX "Todo_userId_completed_idx" ON "Todo"("userId", "completed");

-- CreateIndex
CREATE INDEX "Todo_userId_dueDate_idx" ON "Todo"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "Todo_priority_idx" ON "Todo"("priority");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "VerificationToken_expires_idx" ON "VerificationToken"("expires");
