

//Variables

//The clear button removes todos that are ___ days old or older
let daysOld = 2

//This is an array that contains the class IDs to remove.
// You can find the class id of a class to remove
// by looking at the course URL. Ex: https://canvas.wisc.edu/courses/325705

let classIDsToRemove = [325705, 325845, 325785, 325276, 297036, 325706, 275128, 297570];





function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}
let cardSelector = ".ic-DashboardCard";

async function removeUnneededClasses() {
	await waitForElm(".ic-DashboardCard__action-layout");
	await delay(500);
	let cardHeaders = document.querySelectorAll(cardSelector);
	cardHeaders.forEach((e) => {
		classIDsToRemove.some((s) => {
			if (e.querySelector("a")?.href.includes(s)) {
				e.remove();
			}
		});
	});
}
async function removeFooter() {
	await waitForElm("footer")
	let footer = document.querySelector("footer");
	footer?.remove();
}

function waitForElm(selector) {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

async function addGrades() {
	await waitForElm(".ic-DashboardCard__action-container");
	let selfInfo = await fetch(window.location.origin + "/api/v1/users/self", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
	});
	let json = await selfInfo.json();
	let userID = json.id;

	let enrollmentsData = await fetch(
		window.location.origin + `/api/v1/users/${userID}/enrollments`
	);
	let enrollmentsJson = await enrollmentsData.json();
	let classesWithGradesOnly = {};
	for (let i = 0; i < enrollmentsJson.length; i++) {
		if (enrollmentsJson[i].grades.html_url) {
			classesWithGradesOnly[enrollmentsJson[i].course_id] =
				enrollmentsJson[i];
		}
	}

	let remainingCards = document.querySelectorAll(cardSelector);
	remainingCards.forEach((e) => {
		let elementLink = e?.querySelector("a").href;
		let classId = elementLink.replaceAll(
			window.location.href + "courses/",
			""
		);

		
		let grade = document.createElement("a");
		grade.className = "ic-DashboardCard__action grade";
		let gradeHTMLUrl =
			classesWithGradesOnly[classId]?.grades?.html_url ??
			"courses/" + classId;
		//console.log(gradeHTMLUrl)
		grade.href = gradeHTMLUrl;
		let gradeScore = classesWithGradesOnly[classId]?.grades.current_score;
		grade.innerHTML = gradeScore ? "Hover to show grade" : "No grade found";
		if (gradeScore) {
			grade.addEventListener("mouseenter", (e) => {
				grade.innerHTML = gradeScore;
			});
			grade.addEventListener("mouseleave", (e) => {
				grade.innerHTML = gradeScore
					? "Hover to show grade"
					: "No grade found";
			});
		}
		e.appendChild(grade);
	});
}
async function addToDoButton() {
	await waitForElm(".todo-list-header");
	await waitForElm("#secondWrapper")
	let toDoSidebar = document.querySelector(
		".Sidebar__TodoListContainer > div"
	);
	let toDoHeader = toDoSidebar.querySelector(".todo-list-header");
	let newButton = document.createElement("button");
	newButton.innerHTML = "Remove old todos";
	newButton.className = "remove-todo-button";
	// console.log(toDoSidebar);
	toDoHeader.insertAdjacentElement("afterend", newButton);
	newButton.onclick = () => {
		removeOldToDos();
	};
}

async function removeOldToDos() {
	let toDoEls = document.querySelectorAll(".ToDoSidebarItem");
	if (toDoEls.length != 0) {
		toDoEls.forEach((e) => {
			let xButton = e.querySelector(
				".ToDoSidebarItem__Close > span > button"
			);
			let toDoDate = e.querySelectorAll(
				".ToDoSidebarItem__Info > ul > li"
			);
			let toDoTitle = e.querySelector(
				".ToDoSidebarItem__Info > div > a > span"
			).innerText;
			//console.log(toDoTitle)
			toDoDate.forEach((d) => {
				if (!d.textContent.includes("points")) {
					let dateStringUnmod = d.textContent;
					var secondSpaceIndex = dateStringUnmod.indexOf(
						" ",
						dateStringUnmod.indexOf(" ") + 1
					);
					var substring = dateStringUnmod.substring(
						0,
						secondSpaceIndex
					);
					let now = new Date();
					let twoDaysAgo = new Date().setDate(now.getDate() - daysOld);

					let thisAssignmentDate = new Date(substring);
					thisAssignmentDate.setFullYear(now.getFullYear());
					twoDaysAgo = new Date(twoDaysAgo);
					if (thisAssignmentDate < twoDaysAgo) {
						// console.log(toDoTitle);
						xButton.click();
						// Danger Zone
					}
				}
			});
		});
	}
}
async function moveFeedback(){
	await waitForElm("#right-side-wrapper");
	await waitForElm(".recent_feedback")
	let rightSideWrapper = document.querySelector("#right-side-wrapper")
	
	let secondRightSideWrapper = rightSideWrapper.cloneNode(true);
	secondRightSideWrapper.setAttribute("id", "secondWrapper")
	let originalFeedback = rightSideWrapper.querySelector(".recent_feedback")
	let originalViewGradesButton = rightSideWrapper.querySelectorAll(".button-sidebar-wide")
	originalFeedback.remove()
	originalViewGradesButton.forEach(e => e.remove())
	let newToDoList = secondRightSideWrapper.querySelector(".Sidebar__TodoListContainer")
	newToDoList.remove()
	rightSideWrapper.parentNode.insertBefore(secondRightSideWrapper, rightSideWrapper)

}
moveFeedback();
removeUnneededClasses();
removeFooter();
addToDoButton();
addGrades();

