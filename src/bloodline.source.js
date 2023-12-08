window.BO = {};

(function($){
	"use strict";
	
	function initDynamictabs () {
		var url = new URL(window.location.href),
			tab = url.searchParams.get('tab');
			
		$("[data-widget='dyntabs']").on('click', 'button', function (evt) {
			evt.preventDefault();
			
			var $thisButton = $(evt.target),
				thisButtonId = $thisButton.data('id');
			
			// Remove from currently selected tab and tab contents.
			$(evt.delegateTarget).find('.bl-active').removeClass('bl-active');
			$('.bl-tab-content').removeClass('bl-active');
			
			// Add to clicked tab and tab content.
			evt.target.classList.add('bl-active');
			document.getElementById(thisButtonId).classList.add('bl-active');
		});
		
		// If a tab param comes in, show that by default (via just trigger click).
		if (tab) {
			try {
				$("[data-widget='dyntabs']").find("[data-id='" + tab + "'").trigger('click');
			}
			catch (e) {}
		}
	}
	window.BO.initDynamictabs = initDynamictabs;


	function initSelectWidgets () {
		$("select:not([data-init='false'])").each(function () {
			var $t = $(this);
			$t.select2({
				placeholder: $t.data("placeholder"),
				tags: $t.data("tags"),
				allowClear: $t.data("allowclear"),
				minimumResultsForSearch: ($t.data("minimum-results-for-search") || 20),
				width: $t.data("width") || '100%'
			}).on('select2:unselect', function () {
				setTimeout(function () {
					$t.select2('close');
				}, 1);
			});
		});
		
		// Fix for select2 not focusing on search field on single-select.
		$(document).on("select2:open", function () {
			var allFound = document.querySelectorAll(
				".select2-container--open .select2-search__field"
			);
			allFound[allFound.length - 1].focus();
		});
	}
	window.BO.initSelectWidgets = initSelectWidgets;


	function setupDatatableWidget ($table) {
		function adjustTableElements () {
			var $tablewidgetContainer = $table.parent(),
				$buttonCon = $tablewidgetContainer.find(".dt-buttons");
			
			$table.children('.dataTables_length').addClass('tl');
			//$buttonCon.prependTo($tablewidgetContainer);
			$buttonCon.after($('.dataTables_length'));
			$buttonCon.find('button').removeClass("dt-button").addClass("pointer ba bw1 ph3 pv2 bl-animate-all border-box br1 b--blue bg-blue hover-bg-dark-blue hover-b--dark-blue white mb3 db ml-auto-ns").text('Export table to Excel');
			$tablewidgetContainer.find(".dataTables_filter").find("input").attr('style','width:auto;margin-left:8px;');
		}
		
		$table.DataTable({
			colReorder: true,
			info: true,
			ordering: true,
			paging: true,
			pageLength: 25,
			responsive: true,
			scrollCollapse: true,
			searching: true,
			language: {
				search: "Filter the table:"
			}
		});
		
		$table.parent().find('select').data('width','auto');
		window.BO.initSelectWidgets();
		adjustTableElements();
	}
	window.BO.setupDatatableWidget = setupDatatableWidget;
	
	
	function hotlinkRows ($scope) {
		if (!$scope) {
			$scope = $("[data-widget='hotlinkrows']");
		}
		$scope.on('click keypress', 'td', function (evt) {
			var url = $(this).parent().data('url');
			if ((evt.type === 'click' || evt.which === 13) && url) {
				window.location.href = url;
			}
		});
	}
	window.BO.hotlinkRows = hotlinkRows;
	
	
	// Auto expand textarea up to certain # px height.
	function autoExpandTextarea () {
		$('.bl-common-autotextarea').each(function () {
			var $ta = $(this),
				maxHeight = $ta.data('maxheight') || 300,
				height =  Math.min($ta.prop('scrollHeight'), maxHeight)+2;
				
			if (height < 50) {
				height = 50;
			}
			
			// Set onload.
			$ta.css('height', '').css('height', height + 'px');

			// Set on input.
			$ta.on('input', function () {
				$ta.css('height', '').css('height', Math.min($ta.prop('scrollHeight'), maxHeight)+2 + 'px');
			});
		});
	}
	

	$(function () {
		
		hotlinkRows();
		
		initSelectWidgets();

		autoExpandTextarea();
		
		$("[data-widget='datatable']").each(function(){
			setupDatatableWidget($(this));
		});
		
		if ($("[data-widget='dyntabs']").length > 0) {
			initDynamictabs();
		}
		
	});
	
	
})(jQuery);


